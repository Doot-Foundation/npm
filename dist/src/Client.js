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
class Client {
    constructor(key) {
        this.Key = key;
        this.BaseURL = "http://localhost:3000";
        this.MinaEnpoint = "https://proxy.devnet.minaexplorer.com/graphql";
        this.Doot = o1js_1.PublicKey.fromBase58("B62qoewPcZFiqZUYZgqjrkYH5irW7wamaB2izCC6wgHzjtgZFNjHg6p");
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
    async Price(token) {
        if (validtokens.indexOf(token) === -1) {
            throw new Error("Invalid token!");
        }
        try {
            let response;
            let data;
            response = await axios_1.default.get(`${this.BaseURL}/api/get/price?token=${token}`, {
                headers: {
                    Authorization: `Bearer ${this.Key}`,
                },
            });
            if (!response?.data?.data) {
                const Devnet = o1js_1.Mina.Network(this.MinaEnpoint);
                o1js_1.Mina.setActiveInstance(Devnet);
                let accountInfo = {
                    publicKey: this.Doot,
                };
                await (0, o1js_1.fetchAccount)(accountInfo);
                const cacheFiles = await (0, LoadCache_1.fetchFiles)();
                await Doot_js_1.Doot.compile({ cache: (0, LoadCache_1.DootFileSystem)(cacheFiles) });
                const dootZkApp = new Doot_js_1.Doot(this.Doot);
                const validToken = this.capitalizeFirstLetter(token);
                let tokenPriceOnChain = await dootZkApp.getPrice(o1js_1.CircuitString.fromString(validToken));
                const results = {
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
            }
            else {
                data = response.data.data;
                const price = data.price_data.price;
                const decimals = String(data.price_data.decimals);
                const aggregationTimestamp = String(data.price_data.aggregationTimestamp);
                const signature = data.price_data.signature.signature;
                const oracle = data.price_data.signature.publicKey;
                const proof_data = JSON.stringify(data.proof_data);
                const results = {
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
        }
        catch (error) {
            throw new Error(`Failed to fetch data: ${error.message}`);
        }
    }
}
exports.Client = Client;
