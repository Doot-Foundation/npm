import axios, { AxiosResponse } from "axios";
import { Field } from "o1js";

const validAssets: string[] = [
  "mina",
  "ethereum",
  "solana",
  "bitcoin",
  "chainlink",
];

export interface ClientResult {
  asset: string;
  price: Field;
  decimals: Field;
  timestamp: Field;
}

export class Client {
  private Key: bigint;
  private baseURL: string = "https://doot.foundation";

  constructor(key: bigint) {
    this.Key = key;
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

      const price = Field.from(response.data.price * 10000000000n);
      const decimals = Field.from(10);
      const timestamp = Field.from(response.data.timestamp);

      const results: ClientResult = {
        price: price,
        decimals: decimals,
        timestamp: timestamp,
        asset: asset,
      };
      return results; // Return API response data
    } catch (error: any) {
      // Handle errors (e.g., log, throw, etc.)
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }
}
