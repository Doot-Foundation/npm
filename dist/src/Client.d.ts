interface ClientResultObject {
    asset: string;
    price: string;
    decimals: string;
    signature: string;
    oracle: string;
}
declare class Client {
    Key: string;
    BaseURL: string;
    constructor(key: string);
    isKeyValid(): Promise<boolean>;
    Price(asset: string): Promise<ClientResultObject>;
}
export { Client, ClientResultObject };
