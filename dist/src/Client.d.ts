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
    constructor(key: string);
    capitalizeFirstLetter(input: string): string;
    isKeyValid(): Promise<boolean>;
    /**
     * Main method with API -> L2 -> L1 fallback logic
     */
    getData(token: string): Promise<ClientResultObject>;
    /**
     * Legacy method for backward compatibility
     */
    Price(token: string): Promise<ClientResultObject>;
    /**
     * Get data from backend API (updated to match UI endpoints)
     */
    getDataFromAPI(token: string): Promise<ClientResultObject>;
    /**
     * Get data directly from Zeko L2
     */
    getDataFromZekoL2(token: string): Promise<ClientResultObject>;
    /**
     * Get data directly from Mina L1
     */
    getDataFromMinaL1(token: string): Promise<ClientResultObject>;
}
export { Client, ClientResultObject, validtokens };
