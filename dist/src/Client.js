"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validtokens = exports.Client = void 0;
const axios_1 = __importDefault(require("axios"));
const o1js_1 = require("o1js");
const LoadCache_1 = require("./LoadCache");
const Doot_js_1 = require("./constants/Doot.js");
const validtokens = [
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
exports.validtokens = validtokens;
// Token index mapping for price array
const tokenIndexMap = {
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
class Client {
    constructor(key) {
        this.Key = key;
        this.BaseURL = "http://localhost:3000";
        // Updated endpoints from bootstrap docs
        this.MinaL1Endpoint = "https://api.minascan.io/node/devnet/v1/graphql";
        this.ZekoL2Endpoint = "https://devnet.zeko.io/graphql";
        // L1 address (filler - same as L2 for now)
        this.DootL1Address = o1js_1.PublicKey.fromBase58("B62qp1HAN4DhUa2x9pDLT5pR2FBHAbDRZ32o4japp9HJigHoBKfy6iR");
        // L2 address (actual deployed)
        this.DootL2Address = o1js_1.PublicKey.fromBase58("B62qp1HAN4DhUa2x9pDLT5pR2FBHAbDRZ32o4japp9HJigHoBKfy6iR");
    }
    capitalizeFirstLetter(input) {
        if (!input)
            return input;
        return input.charAt(0).toUpperCase() + input.slice(1);
    }
    async isKeyValid() {
        try {
            const response = await axios_1.default.get(`${this.BaseURL}/api/get/user/getKeyStatus`, {
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
    /**
     * Main method with API -> L2 -> L1 fallback logic
     */
    async getData(token) {
        if (validtokens.indexOf(token) === -1) {
            throw new Error(`Invalid token! Supported: ${validtokens.join(', ')}`);
        }
        // Try API first
        try {
            return await this.getDataFromAPI(token);
        }
        catch (apiError) {
            console.log(`API failed: ${apiError}`);
            // Try L2 next
            try {
                return await this.getDataFromZekoL2(token);
            }
            catch (l2Error) {
                console.log(`L2 failed: ${l2Error}`);
                // Try L1 last
                try {
                    return await this.getDataFromMinaL1(token);
                }
                catch (l1Error) {
                    throw new Error(`All sources failed - API: ${apiError}, L2: ${l2Error}, L1: ${l1Error}`);
                }
            }
        }
    }
    /**
     * Legacy method for backward compatibility
     */
    async Price(token) {
        return this.getData(token);
    }
    /**
     * Get data from backend API (updated to match UI endpoints)
     */
    async getDataFromAPI(token) {
        if (validtokens.indexOf(token) === -1) {
            throw new Error(`Invalid token! Supported: ${validtokens.join(', ')}`);
        }
        try {
            // Updated to match UI endpoint structure
            const response = await axios_1.default.get(`${this.BaseURL}/api/get/price?token=${token}`, {
                headers: {
                    Authorization: `Bearer ${this.Key}`,
                },
                timeout: 10000, // 10 second timeout
            });
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
        }
        catch (error) {
            throw new Error(`API request failed: ${error.message}`);
        }
    }
    /**
     * Get data directly from Zeko L2
     */
    async getDataFromZekoL2(token) {
        if (validtokens.indexOf(token) === -1) {
            throw new Error(`Invalid token! Supported: ${validtokens.join(', ')}`);
        }
        try {
            // Setup Zeko L2 network
            const ZekoL2 = o1js_1.Mina.Network({
                mina: this.ZekoL2Endpoint,
                archive: this.ZekoL2Endpoint,
            });
            o1js_1.Mina.setActiveInstance(ZekoL2);
            // Fetch account and compile contract
            await (0, o1js_1.fetchAccount)({ publicKey: this.DootL2Address });
            const cacheFiles = await (0, LoadCache_1.fetchFiles)();
            await Doot_js_1.Doot.compile({ cache: (0, LoadCache_1.DootFileSystem)(cacheFiles) });
            const dootZkApp = new Doot_js_1.Doot(this.DootL2Address);
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
        }
        catch (error) {
            throw new Error(`Zeko L2 request failed: ${error.message}`);
        }
    }
    /**
     * Get data directly from Mina L1
     */
    async getDataFromMinaL1(token) {
        if (validtokens.indexOf(token) === -1) {
            throw new Error(`Invalid token! Supported: ${validtokens.join(', ')}`);
        }
        try {
            // Setup Mina L1 network
            const MinaL1 = o1js_1.Mina.Network({
                mina: this.MinaL1Endpoint,
                archive: this.MinaL1Endpoint,
            });
            o1js_1.Mina.setActiveInstance(MinaL1);
            // Fetch account and compile contract
            await (0, o1js_1.fetchAccount)({ publicKey: this.DootL1Address });
            const cacheFiles = await (0, LoadCache_1.fetchFiles)();
            await Doot_js_1.Doot.compile({ cache: (0, LoadCache_1.DootFileSystem)(cacheFiles) });
            const dootZkApp = new Doot_js_1.Doot(this.DootL1Address);
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
        }
        catch (error) {
            throw new Error(`Mina L1 request failed: ${error.message}`);
        }
    }
}
exports.Client = Client;
