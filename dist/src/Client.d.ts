import { PublicKey } from "o1js";
declare const validtokens: string[];
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
declare class Client {
    Key: string;
    BaseURL: string;
    MinaL1Endpoint: string;
    ZekoL2Endpoint: string;
    DootL1Address: PublicKey;
    DootL2Address: PublicKey;
    private withTimeout;
    constructor(key: string);
    /**
     * Check if API key is valid
     */
    isKeyValid(): Promise<boolean>;
    /**
     * Smart fallback system: API → L2 → L1
     * Gets price data with automatic fallback through all available sources
     */
    getData(token: string): Promise<ClientResultObject>;
    /**
     * Get signed price data directly from Doot API (fastest method)
     * Requires valid API key
     */
    getFromAPI(token: string): Promise<ClientResultObject>;
    /**
     * Get price data directly from Zeko L2 blockchain (fast, ~5-30s)
     * Reads from deployed smart contract on Zeko L2
     */
    getFromL2(token: string): Promise<ClientResultObject>;
    /**
     * Get price data directly from Mina L1 blockchain (secure, ~30-60s)
     * Reads from deployed smart contract on Mina L1
     */
    getFromL1(token: string): Promise<ClientResultObject>;
}
export { Client, ClientResultObject, validtokens };
