const axios = require("axios");
const { Field, Signature } = require("o1js");

const validAssets = ["mina", "ethereum", "solana", "bitcoin", "chainlink"];

class Client {
  constructor(key) {
    this.Key = key;
    this.BaseURL = "https://doot.foundation";
  }

  async isKeyValid() {
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

  async Price(asset) {
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
      console.log(data);

      const price = Field.from(data.price);

      const fetchedSignature = data.signature;
      const compatibleSignatureData = BigInt(fetchedSignature.data);
      const finalSignatureObject = {
        signature: fetchedSignature.signature,
        publicKey: fetchedSignature.publicKey,
        data: compatibleSignatureData,
      };
      const signature = Signature.fromObject(finalSignatureObject);

      const decimals = Field.from(10);

      const results = {
        asset: asset,
        price: price,
        decimals: decimals,
        signature: signature,
      };
      return results;
    } catch (error) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }
}

module.exports = Client;
