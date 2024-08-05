"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Doot = exports.PricesArray = exports.IpfsCID = exports.PriceProof = exports.offchainState = void 0;
const o1js_1 = require("o1js");
const o1js_pack_1 = require("o1js-pack");
const { OffchainState, OffchainStateCommitments } = o1js_1.Experimental;
exports.offchainState = OffchainState({
    prices: OffchainState.Map(o1js_1.Field, o1js_1.Field),
});
class PriceProof extends exports.offchainState.Proof {
}
exports.PriceProof = PriceProof;
class IpfsCID extends (0, o1js_pack_1.MultiPackedStringFactory)(2) {
}
exports.IpfsCID = IpfsCID;
class PricesArray extends (0, o1js_1.Struct)({
    prices: o1js_1.Provable.Array(o1js_1.Field, 10),
}) {
}
exports.PricesArray = PricesArray;
let Doot = (() => {
    var _a;
    let _classSuper = o1js_1.SmartContract;
    let _instanceExtraInitializers = [];
    let _commitment_decorators;
    let _commitment_initializers = [];
    let _secret_decorators;
    let _secret_initializers = [];
    let _ipfsCID_decorators;
    let _ipfsCID_initializers = [];
    let _deployerPublicKey_decorators;
    let _deployerPublicKey_initializers = [];
    let _offchainState_decorators;
    let _offchainState_initializers = [];
    let _initBase_decorators;
    let _update_decorators;
    let _getPrice_decorators;
    let _settle_decorators;
    let _verify_decorators;
    return _a = class Doot extends _classSuper {
            constructor() {
                super(...arguments);
                this.commitment = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _commitment_initializers, (0, o1js_1.State)()));
                this.secret = __runInitializers(this, _secret_initializers, (0, o1js_1.State)());
                this.ipfsCID = __runInitializers(this, _ipfsCID_initializers, (0, o1js_1.State)());
                this.deployerPublicKey = __runInitializers(this, _deployerPublicKey_initializers, (0, o1js_1.State)());
                this.offchainState = __runInitializers(this, _offchainState_initializers, (0, o1js_1.State)(OffchainStateCommitments.empty()));
            }
            init() {
                super.init();
                this.deployerPublicKey.set(this.sender.getUnconstrained());
            }
            async initBase(updatedCommitment, updatedIpfsCID, pricesArray, updatedSecret) {
                this.deployerPublicKey.getAndRequireEquals();
                this.secret.getAndRequireEquals();
                this.commitment.getAndRequireEquals();
                this.ipfsCID.getAndRequireEquals();
                /// Can only be called once
                this.secret.requireEquals(o1js_1.Field.from(0));
                this.commitment.set(updatedCommitment);
                this.ipfsCID.set(updatedIpfsCID);
                let lastPriceOption = await exports.offchainState.fields.prices.get(o1js_1.CircuitString.fromString("Mina").hash());
                exports.offchainState.fields.prices.update(o1js_1.CircuitString.fromString("Mina").hash(), {
                    from: lastPriceOption,
                    to: pricesArray.prices[0],
                });
                lastPriceOption = await exports.offchainState.fields.prices.get(o1js_1.CircuitString.fromString("Bitcoin").hash());
                exports.offchainState.fields.prices.update(o1js_1.CircuitString.fromString("Bitcoin").hash(), {
                    from: lastPriceOption,
                    to: pricesArray.prices[1],
                });
                lastPriceOption = await exports.offchainState.fields.prices.get(o1js_1.CircuitString.fromString("Ethereum").hash());
                exports.offchainState.fields.prices.update(o1js_1.CircuitString.fromString("Ethereum").hash(), {
                    from: lastPriceOption,
                    to: pricesArray.prices[2],
                });
                lastPriceOption = await exports.offchainState.fields.prices.get(o1js_1.CircuitString.fromString("Solana").hash());
                exports.offchainState.fields.prices.update(o1js_1.CircuitString.fromString("Solana").hash(), {
                    from: lastPriceOption,
                    to: pricesArray.prices[3],
                });
                lastPriceOption = await exports.offchainState.fields.prices.get(o1js_1.CircuitString.fromString("Ripple").hash());
                exports.offchainState.fields.prices.update(o1js_1.CircuitString.fromString("Ripple").hash(), {
                    from: lastPriceOption,
                    to: pricesArray.prices[4],
                });
                lastPriceOption = await exports.offchainState.fields.prices.get(o1js_1.CircuitString.fromString("Cardano").hash());
                exports.offchainState.fields.prices.update(o1js_1.CircuitString.fromString("Cardano").hash(), {
                    from: lastPriceOption,
                    to: pricesArray.prices[5],
                });
                lastPriceOption = await exports.offchainState.fields.prices.get(o1js_1.CircuitString.fromString("Avalanche").hash());
                exports.offchainState.fields.prices.update(o1js_1.CircuitString.fromString("Avalanche").hash(), {
                    from: lastPriceOption,
                    to: pricesArray.prices[6],
                });
                lastPriceOption = await exports.offchainState.fields.prices.get(o1js_1.CircuitString.fromString("Polygon").hash());
                exports.offchainState.fields.prices.update(o1js_1.CircuitString.fromString("Polygon").hash(), {
                    from: lastPriceOption,
                    to: pricesArray.prices[7],
                });
                lastPriceOption = await exports.offchainState.fields.prices.get(o1js_1.CircuitString.fromString("Chainlink").hash());
                exports.offchainState.fields.prices.update(o1js_1.CircuitString.fromString("Chainlink").hash(), {
                    from: lastPriceOption,
                    to: pricesArray.prices[8],
                });
                lastPriceOption = await exports.offchainState.fields.prices.get(o1js_1.CircuitString.fromString("Dogecoin").hash());
                exports.offchainState.fields.prices.update(o1js_1.CircuitString.fromString("Dogecoin").hash(), {
                    from: lastPriceOption,
                    to: pricesArray.prices[9],
                });
                this.secret.set(o1js_1.Poseidon.hash([updatedSecret]));
            }
            async update(updatedCommitment, updatedIpfsCID, pricesArray, secret) {
                this.deployerPublicKey.getAndRequireEquals();
                this.secret.getAndRequireEquals();
                this.commitment.getAndRequireEquals();
                this.ipfsCID.getAndRequireEquals();
                const sentSecret = o1js_1.Poseidon.hash([secret]);
                this.secret.requireEquals(sentSecret);
                let lastPriceOption = await exports.offchainState.fields.prices.get(o1js_1.CircuitString.fromString("Mina").hash());
                exports.offchainState.fields.prices.update(o1js_1.CircuitString.fromString("Mina").hash(), {
                    from: lastPriceOption,
                    to: pricesArray.prices[0],
                });
                lastPriceOption = await exports.offchainState.fields.prices.get(o1js_1.CircuitString.fromString("Bitcoin").hash());
                exports.offchainState.fields.prices.update(o1js_1.CircuitString.fromString("Bitcoin").hash(), {
                    from: lastPriceOption,
                    to: pricesArray.prices[1],
                });
                lastPriceOption = await exports.offchainState.fields.prices.get(o1js_1.CircuitString.fromString("Ethereum").hash());
                exports.offchainState.fields.prices.update(o1js_1.CircuitString.fromString("Ethereum").hash(), {
                    from: lastPriceOption,
                    to: pricesArray.prices[2],
                });
                lastPriceOption = await exports.offchainState.fields.prices.get(o1js_1.CircuitString.fromString("Solana").hash());
                exports.offchainState.fields.prices.update(o1js_1.CircuitString.fromString("Solana").hash(), {
                    from: lastPriceOption,
                    to: pricesArray.prices[3],
                });
                lastPriceOption = await exports.offchainState.fields.prices.get(o1js_1.CircuitString.fromString("Ripple").hash());
                exports.offchainState.fields.prices.update(o1js_1.CircuitString.fromString("Ripple").hash(), {
                    from: lastPriceOption,
                    to: pricesArray.prices[4],
                });
                lastPriceOption = await exports.offchainState.fields.prices.get(o1js_1.CircuitString.fromString("Cardano").hash());
                exports.offchainState.fields.prices.update(o1js_1.CircuitString.fromString("Cardano").hash(), {
                    from: lastPriceOption,
                    to: pricesArray.prices[5],
                });
                lastPriceOption = await exports.offchainState.fields.prices.get(o1js_1.CircuitString.fromString("Avalanche").hash());
                exports.offchainState.fields.prices.update(o1js_1.CircuitString.fromString("Avalanche").hash(), {
                    from: lastPriceOption,
                    to: pricesArray.prices[6],
                });
                lastPriceOption = await exports.offchainState.fields.prices.get(o1js_1.CircuitString.fromString("Polygon").hash());
                exports.offchainState.fields.prices.update(o1js_1.CircuitString.fromString("Polygon").hash(), {
                    from: lastPriceOption,
                    to: pricesArray.prices[7],
                });
                lastPriceOption = await exports.offchainState.fields.prices.get(o1js_1.CircuitString.fromString("Chainlink").hash());
                exports.offchainState.fields.prices.update(o1js_1.CircuitString.fromString("Chainlink").hash(), {
                    from: lastPriceOption,
                    to: pricesArray.prices[8],
                });
                lastPriceOption = await exports.offchainState.fields.prices.get(o1js_1.CircuitString.fromString("Dogecoin").hash());
                exports.offchainState.fields.prices.update(o1js_1.CircuitString.fromString("Dogecoin").hash(), {
                    from: lastPriceOption,
                    to: pricesArray.prices[9],
                });
                this.commitment.set(updatedCommitment);
                this.ipfsCID.set(updatedIpfsCID);
            }
            async getPrice(token) {
                return (await exports.offchainState.fields.prices.get(token.hash())).orElse(0n);
            }
            async settle(proof) {
                await exports.offchainState.settle(proof);
            }
            async verify(signature, Price) {
                this.deployerPublicKey.getAndRequireEquals();
                const validSignature = signature.verify(this.deployerPublicKey.get(), [
                    Price,
                ]);
                validSignature.assertTrue();
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _commitment_decorators = [(0, o1js_1.state)(o1js_1.Field)];
            _secret_decorators = [(0, o1js_1.state)(o1js_1.Field)];
            _ipfsCID_decorators = [(0, o1js_1.state)(IpfsCID)];
            _deployerPublicKey_decorators = [(0, o1js_1.state)(o1js_1.PublicKey)];
            _offchainState_decorators = [(0, o1js_1.state)(OffchainStateCommitments)];
            _initBase_decorators = [o1js_1.method];
            _update_decorators = [o1js_1.method];
            _getPrice_decorators = [o1js_1.method.returns(o1js_1.Field)];
            _settle_decorators = [o1js_1.method];
            _verify_decorators = [o1js_1.method];
            __esDecorate(_a, null, _initBase_decorators, { kind: "method", name: "initBase", static: false, private: false, access: { has: obj => "initBase" in obj, get: obj => obj.initBase }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(_a, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: obj => "update" in obj, get: obj => obj.update }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(_a, null, _getPrice_decorators, { kind: "method", name: "getPrice", static: false, private: false, access: { has: obj => "getPrice" in obj, get: obj => obj.getPrice }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(_a, null, _settle_decorators, { kind: "method", name: "settle", static: false, private: false, access: { has: obj => "settle" in obj, get: obj => obj.settle }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(_a, null, _verify_decorators, { kind: "method", name: "verify", static: false, private: false, access: { has: obj => "verify" in obj, get: obj => obj.verify }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, null, _commitment_decorators, { kind: "field", name: "commitment", static: false, private: false, access: { has: obj => "commitment" in obj, get: obj => obj.commitment, set: (obj, value) => { obj.commitment = value; } }, metadata: _metadata }, _commitment_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _secret_decorators, { kind: "field", name: "secret", static: false, private: false, access: { has: obj => "secret" in obj, get: obj => obj.secret, set: (obj, value) => { obj.secret = value; } }, metadata: _metadata }, _secret_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _ipfsCID_decorators, { kind: "field", name: "ipfsCID", static: false, private: false, access: { has: obj => "ipfsCID" in obj, get: obj => obj.ipfsCID, set: (obj, value) => { obj.ipfsCID = value; } }, metadata: _metadata }, _ipfsCID_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _deployerPublicKey_decorators, { kind: "field", name: "deployerPublicKey", static: false, private: false, access: { has: obj => "deployerPublicKey" in obj, get: obj => obj.deployerPublicKey, set: (obj, value) => { obj.deployerPublicKey = value; } }, metadata: _metadata }, _deployerPublicKey_initializers, _instanceExtraInitializers);
            __esDecorate(null, null, _offchainState_decorators, { kind: "field", name: "offchainState", static: false, private: false, access: { has: obj => "offchainState" in obj, get: obj => obj.offchainState, set: (obj, value) => { obj.offchainState = value; } }, metadata: _metadata }, _offchainState_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.Doot = Doot;
