import axios, { AxiosResponse } from "axios";
import { Field, Signature } from "o1js";

const validAssets: string[] = [
  "mina",
  "ethereum",
  "solana",
  "bitcoin",
  "chainlink",
];

interface ClientResult {
  asset: string;
  price: Field;
  decimals: Field;
  signature: Signature;
  timestamp: Field;
}

export class Client {
  private Key: string;
  private baseURL: string = "https://doot.foundation";

  constructor(key: string) {
    this.Key = key;
  }

  async isKeyValid(): Promise<boolean> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseURL}/api/get/getKeyStatus`,
        {
          headers: {
            Authorization: `${this.Key}`, // Add authorization header with API key
          },
        }
      );
      return response.data.status;
    } catch (error: any) {
      return false;
    }
  }

  async Price(asset: string): Promise<ClientResult> {
    if (validAssets.indexOf(asset) == -1) {
      throw new Error("Invalid asset!"); // Check if the provided value is valid
    }

    try {
      const response: AxiosResponse = await axios.get(
        `${this.baseURL}/api/get/getPrice?token=${asset}`,
        {
          headers: {
            Authorization: `Bearer ${this.Key}`, // Add authorization header with API key
          },
        }
      );

      if (response.status == 404) {
        // Read from the IPFS pin
      }

      const price = Field.from(response.data.information.price);

      const fetchedSignature = response.data.information.signature;
      const compatibleSignatureData: BigInt = BigInt(
        response.data.information.signature.data
      );
      const finalSignatureObject: any = {
        signature: fetchedSignature.signature,
        publicKey: fetchedSignature.publicKey,
        data: compatibleSignatureData,
      };

      const signature = Signature.fromObject(finalSignatureObject);
      const decimals = Field.from(10);
      const timestamp = Field.from(response.data.timestamp);

      const results: ClientResult = {
        asset: asset,
        price: price,
        decimals: decimals,
        signature: signature,
        timestamp: timestamp,
      };
      return results;
    } catch (error: any) {
      // Handle errors (e.g., log, throw, etc.)
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }
}
