import axios from "axios";
import { Mina, PublicKey, fetchAccount } from "o1js";
import { fetchFiles, DootFileSystem } from "./LoadCache";
import { Doot } from "./constants/Doot.js";

const validtokens: string[] = [
  "mina",
  "ethereum",
  "solana",
  "bitcoin",
  "chainlink",
  "ripple",
  "dogecoin",
  "polygon",
  "avalanche",
  "cardano",
];

// Token index mapping for price array
const tokenIndexMap: Record<string, number> = {
  "mina": 0,
  "bitcoin": 1,
  "ethereum": 2,
  "solana": 3,
  "ripple": 4,
  "cardano": 5,
  "avalanche": 6,
  "polygon": 7,
  "chainlink": 8,
  "dogecoin": 9,
};

interface ClientResultObject {
  fromAPI: boolean;
  fromL2: boolean;
  fromL1: boolean;
  source: 'API' | 'L2' | 'L1';
  price_data: {
    token: string;
    price: string;
    decimals: string;
    aggregationTimestamp: string;
    signature: string;
    oracle: string;
  };
  proof_data: string;
}

class Client {
  Key: string;
  BaseURL: string;
  MinaL1Endpoint: string;
  ZekoL2Endpoint: string;
  DootL1Address: PublicKey;
  DootL2Address: PublicKey;

  constructor(key: string) {
    this.Key = key;
    this.BaseURL = "https://doot.foundation";
    // Updated endpoints from bootstrap docs
    this.MinaL1Endpoint = "https://api.minascan.io/node/devnet/v1/graphql";
    this.ZekoL2Endpoint = "https://devnet.zeko.io/graphql";
    // L1 address (filler - same as L2 for now)
    this.DootL1Address = PublicKey.fromBase58(
      "B62qp1HAN4DhUa2x9pDLT5pR2FBHAbDRZ32o4japp9HJigHoBKfy6iR"
    );
    // L2 address (actual deployed)
    this.DootL2Address = PublicKey.fromBase58(
      "B62qp1HAN4DhUa2x9pDLT5pR2FBHAbDRZ32o4japp9HJigHoBKfy6iR"
    );
  }
  capitalizeFirstLetter(input: string): string {
    if (!input) return input;
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  async isKeyValid(): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.BaseURL}/api/get/user/getKeyStatus`,
        {
          headers: {
            Authorization: `${this.Key}`,
          },
        }
      );
      return response.data.status;
    } catch (error) {
      return false;
    }
  }

  /**
   * Main method with API -> L2 -> L1 fallback logic
   */
  async getData(token: string): Promise<ClientResultObject> {
    if (validtokens.indexOf(token) === -1) {
      throw new Error(`Invalid token! Supported: ${validtokens.join(', ')}`);
    }

    // Try API first
    try {
      return await this.getDataFromAPI(token);
    } catch (apiError) {
      console.log(`API failed: ${apiError}`);

      // Try L2 next
      try {
        return await this.getDataFromZekoL2(token);
      } catch (l2Error) {
        console.log(`L2 failed: ${l2Error}`);

        // Try L1 last
        try {
          return await this.getDataFromMinaL1(token);
        } catch (l1Error) {
          throw new Error(`All sources failed - API: ${apiError}, L2: ${l2Error}, L1: ${l1Error}`);
        }
      }
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  async Price(token: string): Promise<ClientResultObject> {
    return this.getData(token);
  }

  /**
   * Get data from backend API (updated to match UI endpoints)
   */
  async getDataFromAPI(token: string): Promise<ClientResultObject> {
    if (validtokens.indexOf(token) === -1) {
      throw new Error(`Invalid token! Supported: ${validtokens.join(', ')}`);
    }

    try {
      // Updated to match actual API endpoint
      const response = await axios.get(
        `${this.BaseURL}/api/get/getPrice?token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${this.Key}`,
          },
          timeout: 10000, // 10 second timeout
        }
      );

      if (!response?.data?.data) {
        throw new Error('No data received from API');
      }

      const data = response.data.data;
      const price = data.price_data.price;
      const decimals = String(data.price_data.decimals);
      const aggregationTimestamp = String(data.price_data.aggregationTimestamp);
      const signature = data.price_data.signature.signature;
      const oracle = data.price_data.signature.publicKey;
      const proof_data = JSON.stringify(data.proof_data);

      return {
        fromAPI: true,
        fromL2: false,
        fromL1: false,
        source: 'API',
        price_data: {
          token: token,
          price: price,
          decimals: decimals,
          aggregationTimestamp: aggregationTimestamp,
          signature: signature,
          oracle: oracle,
        },
        proof_data: JSON.stringify(proof_data),
      };
    } catch (error: any) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  /**
   * Get data directly from Zeko L2
   */
  async getDataFromZekoL2(token: string): Promise<ClientResultObject> {
    if (validtokens.indexOf(token) === -1) {
      throw new Error(`Invalid token! Supported: ${validtokens.join(', ')}`);
    }

    try {
      // Setup Zeko L2 network
      const ZekoL2 = Mina.Network({
        mina: this.ZekoL2Endpoint,
        archive: this.ZekoL2Endpoint,
      });
      Mina.setActiveInstance(ZekoL2);

      // Fetch account and compile contract
      await fetchAccount({ publicKey: this.DootL2Address });
      const cacheFiles = await fetchFiles();
      await Doot.compile({ cache: DootFileSystem(cacheFiles) });

      const dootZkApp = new Doot(this.DootL2Address);
      const allPrices = await dootZkApp.getPrices();

      // Extract specific token price
      const tokenIndex = tokenIndexMap[token];
      if (tokenIndex === undefined) {
        throw new Error(`Token index not found for: ${token}`);
      }

      const tokenPrice = allPrices.prices[tokenIndex];

      return {
        fromAPI: false,
        fromL2: true,
        fromL1: false,
        source: 'L2',
        price_data: {
          token: token,
          price: tokenPrice.toString(),
          decimals: "10",
          aggregationTimestamp: Date.now().toString(),
          signature: "",
          oracle: this.DootL2Address.toBase58(),
        },
        proof_data: "",
      };
    } catch (error: any) {
      throw new Error(`Zeko L2 request failed: ${error.message}`);
    }
  }

  /**
   * Get data directly from Mina L1
   */
  async getDataFromMinaL1(token: string): Promise<ClientResultObject> {
    if (validtokens.indexOf(token) === -1) {
      throw new Error(`Invalid token! Supported: ${validtokens.join(', ')}`);
    }

    try {
      // Setup Mina L1 network
      const MinaL1 = Mina.Network({
        mina: this.MinaL1Endpoint,
        archive: this.MinaL1Endpoint,
      });
      Mina.setActiveInstance(MinaL1);

      // Fetch account and compile contract
      await fetchAccount({ publicKey: this.DootL1Address });
      const cacheFiles = await fetchFiles();
      await Doot.compile({ cache: DootFileSystem(cacheFiles) });

      const dootZkApp = new Doot(this.DootL1Address);
      const allPrices = await dootZkApp.getPrices();

      // Extract specific token price
      const tokenIndex = tokenIndexMap[token];
      if (tokenIndex === undefined) {
        throw new Error(`Token index not found for: ${token}`);
      }

      const tokenPrice = allPrices.prices[tokenIndex];

      return {
        fromAPI: false,
        fromL2: false,
        fromL1: true,
        source: 'L1',
        price_data: {
          token: token,
          price: tokenPrice.toString(),
          decimals: "10",
          aggregationTimestamp: Date.now().toString(),
          signature: "",
          oracle: this.DootL1Address.toBase58(),
        },
        proof_data: "",
      };
    } catch (error: any) {
      throw new Error(`Mina L1 request failed: ${error.message}`);
    }
  }
}

export { Client, ClientResultObject, validtokens };
