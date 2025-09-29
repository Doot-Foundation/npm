import { SmartContract, Field, State, PublicKey, Signature } from 'o1js';
declare const TokenInformationArray_base: (new (value: {
    prices: import("o1js/dist/node/lib/provable/field").Field[];
}) => {
    prices: import("o1js/dist/node/lib/provable/field").Field[];
}) & {
    _isStruct: true;
} & Omit<import("o1js/dist/node/lib/provable/types/provable-intf").Provable<{
    prices: import("o1js/dist/node/lib/provable/field").Field[];
}, {
    prices: bigint[];
}>, "fromFields"> & {
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        prices: import("o1js/dist/node/lib/provable/field").Field[];
    };
} & {
    fromValue: (value: {
        prices: import("o1js/dist/node/lib/provable/field").Field[] | bigint[];
    }) => {
        prices: import("o1js/dist/node/lib/provable/field").Field[];
    };
    toInput: (x: {
        prices: import("o1js/dist/node/lib/provable/field").Field[];
    }) => {
        fields?: Field[] | undefined;
        packed?: [Field, number][] | undefined;
    };
    toJSON: (x: {
        prices: import("o1js/dist/node/lib/provable/field").Field[];
    }) => {
        prices: string[];
    };
    fromJSON: (x: {
        prices: string[];
    }) => {
        prices: import("o1js/dist/node/lib/provable/field").Field[];
    };
    empty: () => {
        prices: import("o1js/dist/node/lib/provable/field").Field[];
    };
};
export declare class TokenInformationArray extends TokenInformationArray_base {
}
export declare const offchainState: import("o1js/dist/node/lib/mina/v1/actions/offchain-state").OffchainState<{
    readonly tokenInformation: {
        kind: "offchain-map";
        keyType: typeof import("o1js/dist/node/lib/provable/field").Field & ((x: string | number | bigint | import("o1js/dist/node/lib/provable/core/fieldvar").FieldConst | import("o1js/dist/node/lib/provable/core/fieldvar").FieldVar | import("o1js/dist/node/lib/provable/field").Field) => import("o1js/dist/node/lib/provable/field").Field);
        valueType: typeof TokenInformationArray;
    };
}>;
export declare class TokenInformationArrayProof extends offchainState.Proof {
}
declare const IpfsCID_base: {
    new (packed: Array<Field>): {
        toString(): string;
        toFields(): Array<Field>;
        assertEquals(other: {
            toFields(): Array<Field>;
            assertEquals(other: any): void;
            packed: import("o1js/dist/node/lib/provable/field").Field[];
        }): void;
        packed: import("o1js/dist/node/lib/provable/field").Field[];
    };
    extractField(input: import("o1js").Character): Field;
    sizeInBits(): bigint;
    elementsPerField(): number;
    unpack(fields: Field[]): import("o1js").Character[];
    fromCharacters(input: Array<import("o1js").Character>): {
        toString(): string;
        toFields(): Array<Field>;
        assertEquals(other: {
            toFields(): Array<Field>;
            assertEquals(other: any): void;
            packed: import("o1js/dist/node/lib/provable/field").Field[];
        }): void;
        packed: import("o1js/dist/node/lib/provable/field").Field[];
    };
    fromString(str: string): {
        toString(): string;
        toFields(): Array<Field>;
        assertEquals(other: {
            toFields(): Array<Field>;
            assertEquals(other: any): void;
            packed: import("o1js/dist/node/lib/provable/field").Field[];
        }): void;
        packed: import("o1js/dist/node/lib/provable/field").Field[];
    };
    type: import("o1js/dist/node/bindings/lib/generic").GenericProvableExtendedPure<{
        packed: import("o1js/dist/node/lib/provable/field").Field[];
    }, {
        packed: bigint[];
    }, {
        packed: string[];
    }, import("o1js/dist/node/lib/provable/field").Field>;
    l: number;
    n: number;
    bitSize: bigint;
    checkPack(unpacked: import("o1js").Character[]): void;
    pack(unpacked: import("o1js").Character[]): Array<Field>;
    unpackToBigints(fields: Array<Field>): Array<bigint>;
    _isStruct: true;
    toFields: (value: {
        packed: import("o1js/dist/node/lib/provable/field").Field[];
    }) => import("o1js/dist/node/lib/provable/field").Field[];
    toAuxiliary: (value?: {
        packed: import("o1js/dist/node/lib/provable/field").Field[];
    } | undefined) => any[];
    sizeInFields: () => number;
    check: (value: {
        packed: import("o1js/dist/node/lib/provable/field").Field[];
    }) => void;
    toValue: (x: {
        packed: import("o1js/dist/node/lib/provable/field").Field[];
    }) => {
        packed: bigint[];
    };
    fromValue: ((x: {
        packed: import("o1js/dist/node/lib/provable/field").Field[];
    } | {
        packed: bigint[];
    }) => {
        packed: import("o1js/dist/node/lib/provable/field").Field[];
    }) & ((value: {
        packed: import("o1js/dist/node/lib/provable/field").Field[] | bigint[];
    }) => {
        packed: import("o1js/dist/node/lib/provable/field").Field[];
    });
    fromFields: (fields: import("o1js/dist/node/lib/provable/field").Field[]) => {
        packed: import("o1js/dist/node/lib/provable/field").Field[];
    };
    toInput: (x: {
        packed: import("o1js/dist/node/lib/provable/field").Field[];
    }) => {
        fields?: Field[] | undefined;
        packed?: [Field, number][] | undefined;
    };
    toJSON: (x: {
        packed: import("o1js/dist/node/lib/provable/field").Field[];
    }) => {
        packed: string[];
    };
    fromJSON: (x: {
        packed: string[];
    }) => {
        packed: import("o1js/dist/node/lib/provable/field").Field[];
    };
    empty: () => {
        packed: import("o1js/dist/node/lib/provable/field").Field[];
    };
};
export declare class IpfsCID extends IpfsCID_base {
}
export declare class Doot extends SmartContract {
    commitment: State<import("o1js/dist/node/lib/provable/field").Field>;
    ipfsCID: State<IpfsCID>;
    owner: State<PublicKey>;
    offchainStateCommitments: State<import("o1js/dist/node/lib/mina/v1/actions/offchain-state-rollup").OffchainStateCommitments>;
    init(): void;
    offchainState: import("o1js/dist/node/lib/mina/v1/actions/offchain-state").OffchainStateInstance<{
        readonly tokenInformation: {
            kind: "offchain-map";
            keyType: typeof import("o1js/dist/node/lib/provable/field").Field & ((x: string | number | bigint | import("o1js/dist/node/lib/provable/core/fieldvar").FieldConst | import("o1js/dist/node/lib/provable/core/fieldvar").FieldVar | import("o1js/dist/node/lib/provable/field").Field) => import("o1js/dist/node/lib/provable/field").Field);
            valueType: typeof TokenInformationArray;
        };
    }>;
    initBase(updatedCommitment: Field, updatedIpfsCID: IpfsCID, informationArray: TokenInformationArray): Promise<void>;
    update(updatedCommitment: Field, updatedIpfsCID: IpfsCID, informationArray: TokenInformationArray): Promise<void>;
    getPrices(): Promise<TokenInformationArray>;
    settle(proof: TokenInformationArrayProof): Promise<void>;
    verify(signature: Signature, deployer: PublicKey, Price: Field): Promise<void>;
}
export {};
