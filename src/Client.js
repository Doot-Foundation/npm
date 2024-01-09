"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const axios_1 = __importDefault(require("axios"));
const o1js_1 = require("o1js");
const validAssets = [
    "mina",
    "ethereum",
    "solana",
    "bitcoin",
    "chainlink",
];
class Client {
    constructor(key) {
        this.baseURL = "https://doot.foundation";
        this.Key = key;
    }
    async isKeyValid() {
        try {
            const response = await axios_1.default.get(`${this.baseURL}/api/get/getUserStatus`, {
                headers: {
                    Authorization: `Bearer ${this.Key}`, // Add authorization header with API key
                },
            });
            return response.data.status;
        }
        catch (error) {
            return false;
        }
    }
    async Price(asset) {
        if (validAssets.indexOf(asset) == -1) {
            throw new Error("Invalid asset!"); // Check if the provided value is valid
        }
        try {
            const response = await axios_1.default.get(`${this.baseURL}/api/get/getPrice?token=${asset}`, {
                headers: {
                    Authorization: `Bearer ${this.Key}`, // Add authorization header with API key
                },
            });
            if (response.status == 404) {
                // Read from the IPFS pin
            }
            const price = o1js_1.Field.from(response.data.information.price);
            const fetchedSignature = response.data.information.signature;
            const compatibleSignatureData = BigInt(response.data.information.signature.data);
            const finalSignatureObject = {
                signature: fetchedSignature.signature,
                publicKey: fetchedSignature.publicKey,
                data: compatibleSignatureData,
            };
            const signature = o1js_1.Signature.fromObject(finalSignatureObject);
            const decimals = o1js_1.Field.from(10);
            const timestamp = o1js_1.Field.from(response.data.timestamp);
            const results = {
                asset: asset,
                price: price,
                decimals: decimals,
                signature: signature,
                timestamp: timestamp,
            };
            return results;
        }
        catch (error) {
            // Handle errors (e.g., log, throw, etc.)
            throw new Error(`Failed to fetch data: ${error.message}`);
        }
    }
}
exports.Client = Client;
