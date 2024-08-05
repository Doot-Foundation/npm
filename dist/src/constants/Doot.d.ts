import { SmartContract, Field, State, PublicKey, Signature, CircuitString } from "o1js";
export declare const offchainState: import("o1js/dist/node/lib/mina/actions/offchain-state").OffchainState<{
    readonly prices: {
        kind: "offchain-map";
        keyType: typeof import("o1js/dist/node/lib/provable/field").Field & ((x: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field | import("o1js/dist/node/lib/provable/core/fieldvar").FieldVar | import("o1js/dist/node/lib/provable/core/fieldvar").FieldConst) => import("o1js/dist/node/lib/provable/field").Field);
        valueType: typeof import("o1js/dist/node/lib/provable/field").Field & ((x: string | number | bigint | import("o1js/dist/node/lib/provable/field").Field | import("o1js/dist/node/lib/provable/core/fieldvar").FieldVar | import("o1js/dist/node/lib/provable/core/fieldvar").FieldConst) => import("o1js/dist/node/lib/provable/field").Field);
    };
}>;
export declare class PriceProof extends offchainState.Proof {
}
declare const IpfsCID_base: {
    new (packed: import("o1js/dist/node/lib/provable/field").Field[]): {
        toString(): string;
        toFields(): import("o1js/dist/node/lib/provable/field").Field[];
        assertEquals(other: {
            toFields(): import("o1js/dist/node/lib/provable/field").Field[];
            assertEquals(other: any): void;
            packed: import("o1js/dist/node/lib/provable/field").Field[];
        }): void;
        packed: import("o1js/dist/node/lib/provable/field").Field[];
    };
    extractField(input: import("o1js/dist/node/lib/provable/string").Character): import("o1js/dist/node/lib/provable/field").Field;
    sizeInBits(): bigint;
    elementsPerField(): number;
    unpack(fields: import("o1js/dist/node/lib/provable/field").Field[]): import("o1js/dist/node/lib/provable/string").Character[];
    fromCharacters(input: import("o1js/dist/node/lib/provable/string").Character[]): {
        toString(): string;
        toFields(): import("o1js/dist/node/lib/provable/field").Field[];
        assertEquals(other: {
            toFields(): import("o1js/dist/node/lib/provable/field").Field[];
            assertEquals(other: any): void;
            packed: import("o1js/dist/node/lib/provable/field").Field[];
        }): void;
        packed: import("o1js/dist/node/lib/provable/field").Field[];
    };
    fromString(str: string): {
        toString(): string;
        toFields(): import("o1js/dist/node/lib/provable/field").Field[];
        assertEquals(other: {
            toFields(): import("o1js/dist/node/lib/provable/field").Field[];
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
    checkPack(unpacked: import("o1js/dist/node/lib/provable/string").Character[]): void;
    pack(unpacked: import("o1js/dist/node/lib/provable/string").Character[]): import("o1js/dist/node/lib/provable/field").Field[];
    unpackToBigints(fields: import("o1js/dist/node/lib/provable/field").Field[]): bigint[];
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
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
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
declare const PricesArray_base: (new (value: {
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
        fields?: import("o1js/dist/node/lib/provable/field").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/provable/field").Field, number][] | undefined;
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
export declare class PricesArray extends PricesArray_base {
}
export declare class Doot extends SmartContract {
    commitment: State<import("o1js/dist/node/lib/provable/field").Field>;
    secret: State<import("o1js/dist/node/lib/provable/field").Field>;
    ipfsCID: State<IpfsCID>;
    deployerPublicKey: State<PublicKey>;
    offchainState: State<{
        root: import("o1js/dist/node/lib/provable/field").Field;
        length: import("o1js/dist/node/lib/provable/field").Field;
        actionState: import("o1js/dist/node/lib/provable/field").Field;
    }>;
    init(): void;
    initBase(updatedCommitment: Field, updatedIpfsCID: IpfsCID, pricesArray: PricesArray, updatedSecret: Field): Promise<void>;
    update(updatedCommitment: Field, updatedIpfsCID: IpfsCID, pricesArray: PricesArray, secret: Field): Promise<void>;
    getPrice(token: CircuitString): Promise<import("o1js/dist/node/lib/provable/field").Field>;
    settle(proof: PriceProof): Promise<void>;
    verify(signature: Signature, Price: Field): Promise<void>;
}
export {};
