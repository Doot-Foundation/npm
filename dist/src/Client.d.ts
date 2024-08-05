import { PublicKey } from "o1js";
declare const validtokens: string[];
interface ClientResultObject {
    fromMina: boolean;
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
    MinaEnpoint: string;
    Doot: PublicKey;
    constructor(key: string);
    capitalizeFirstLetter(input: string): string;
    isKeyValid(): Promise<boolean>;
    Price(token: string): Promise<ClientResultObject>;
}
export { Client, ClientResultObject, validtokens };
