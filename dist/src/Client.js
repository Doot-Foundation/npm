"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const axios_1 = __importDefault(require("axios"));
const validAssets = [
    "mina",
    "ethereum",
    "solana",
    "bitcoin",
    "chainlink",
];
class Client {
    constructor(key) {
        this.Key = key;
        this.BaseURL = "https://doot.foundation";
    }
    async isKeyValid() {
        try {
            const response = await axios_1.default.get(`${this.BaseURL}/api/get/getKeyStatus`, {
                headers: {
                    Authorization: `${this.Key}`,
                },
            });
            return response.data.status;
        }
        catch (error) {
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
            response = await axios_1.default.get(`${this.BaseURL}/api/get/getPrice?token=${asset}`, {
                headers: {
                    Authorization: `Bearer ${this.Key}`,
                },
            });
            if (!response.data.data) {
                response = await axios_1.default.get(`${this.BaseURL}/api/get/getMinaInfo`, {
                    headers: { Authorization: `Bearer ${this.Key}` },
                });
                data = response.data.data.ipfs.assets[`${asset}`];
            }
            else {
                data = response.data.data;
            }
            const price = data.price;
            const decimals = "10";
            const signature = data.signature.signature;
            const oracle = data.signature.publicKey;
            const results = {
                asset: asset,
                price: price,
                decimals: decimals,
                signature: signature,
                oracle: oracle,
            };
            return results;
        }
        catch (error) {
            throw new Error(`Failed to fetch data: ${error.message}`);
        }
    }
}
exports.Client = Client;
