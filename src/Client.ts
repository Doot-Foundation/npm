import axios from "axios";
import { Mina, PublicKey, fetchAccount, CircuitString } from "o1js";
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

interface ClientResultObject {
  fromMina: boolean;
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
  MinaEnpoint: string;
  Doot: PublicKey;

  constructor(key: string) {
    this.Key = key;
    this.BaseURL = "http://localhost:3000";
    this.MinaEnpoint = "https://proxy.devnet.minaexplorer.com/graphql";
    this.Doot = PublicKey.fromBase58(
      "B62qoewPcZFiqZUYZgqjrkYH5irW7wamaB2izCC6wgHzjtgZFNjHg6p"
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

  async Price(token: string): Promise<ClientResultObject> {
    if (validtokens.indexOf(token) === -1) {
      throw new Error("Invalid token!");
    }

    try {
      let response;
      let data;
      response = await axios.get(
        `${this.BaseURL}/api/get/price?token=${token}`,
        {
          headers: {
            Authorization: `Bearer ${this.Key}`,
          },
        }
      );

      if (!response?.data?.data) {
        const Devnet = Mina.Network(this.MinaEnpoint);
        Mina.setActiveInstance(Devnet);

        let accountInfo = {
          publicKey: this.Doot,
        };
        await fetchAccount(accountInfo);

        const cacheFiles = await fetchFiles();
        await Doot.compile({ cache: DootFileSystem(cacheFiles) });
        const dootZkApp = new Doot(this.Doot);

        const validToken = this.capitalizeFirstLetter(token);
        let tokenPriceOnChain = await dootZkApp.getPrice(
          CircuitString.fromString(validToken)
        );

        const results: ClientResultObject = {
          fromMina: true,
          price_data: {
            token: token,
            price: tokenPriceOnChain.toString(),
            decimals: "10",
            aggregationTimestamp: "",
            signature: "",
            oracle: "",
          },
          proof_data: "",
        };

        return results;
      } else {
        data = response.data.data;
        const price = data.price_data.price;
        const decimals = String(data.price_data.decimals);
        const aggregationTimestamp = String(
          data.price_data.aggregationTimestamp
        );
        const signature = data.price_data.signature.signature;
        const oracle = data.price_data.signature.publicKey;
        const proof_data = JSON.stringify(data.proof_data);

        const results: ClientResultObject = {
          fromMina: false,
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

        return results;
      }
    } catch (error: any) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }
}

export { Client, ClientResultObject, validtokens };
