import axios from "axios";
import { Field, Mina, PublicKey, Sign, Signature } from "o1js";

const validAssets: string[] = [
  "mina",
  "ethereum",
  "solana",
  "bitcoin",
  "chainlink",
];

interface ClientResultObject {
  asset: string;
  price: string;
  decimals: string;
  signature: string;
  oracle: string;
}

class Client {
  Key: string;
  BaseURL: string;

  constructor(key: string) {
    this.Key = key;
    this.BaseURL = "https://doot.foundation";
  }

  async isKeyValid(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.BaseURL}/api/get/getKeyStatus`, {
        headers: {
          Authorization: `${this.Key}`,
        },
      });
      return response.data.status;
    } catch (error) {
      return false;
    }
  }

  async Price(asset: string): Promise<ClientResultObject> {
    if (validAssets.indexOf(asset) === -1) {
      throw new Error("Invalid asset!");
    }

    try {
      let response;
      let data;
      response = await axios.get(
        `${this.BaseURL}/api/get/getPrice?token=${asset}`,
        {
          headers: {
            Authorization: `Bearer ${this.Key}`,
          },
        }
      );

      if (!response.data.data) {
        response = await axios.get(`${this.BaseURL}/api/get/getMinaInfo`, {
          headers: { Authorization: `Bearer ${this.Key}` },
        });
        data = response.data.data.ipfs.assets[`${asset}`];
      } else {
        data = response.data.data;
      }

      const price = data.price;
      const decimals = "10";
      const signature = data.signature.signature;
      const oracle = data.signature.publicKey;

      const results: ClientResultObject = {
        asset: asset,
        price: price,
        decimals: decimals,
        signature: signature,
        oracle: oracle,
      };
      return results;
    } catch (error: any) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }
}

export { Client, ClientResultObject };
