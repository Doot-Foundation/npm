"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Doot = exports.IpfsCID = exports.TokenInformationArrayProof = exports.offchainState = exports.TokenInformationArray = void 0;
const o1js_1 = require("o1js");
const { OffchainState } = o1js_1.Experimental;
const o1js_pack_1 = require("o1js-pack");
class TokenInformationArray extends (0, o1js_1.Struct)({
    prices: o1js_1.Provable.Array(o1js_1.Field, 10),
}) {
}
exports.TokenInformationArray = TokenInformationArray;
exports.offchainState = OffchainState({
    tokenInformation: OffchainState.Map(o1js_1.Field, TokenInformationArray),
}, { maxActionsPerUpdate: 2 });
class TokenInformationArrayProof extends exports.offchainState.Proof {
}
exports.TokenInformationArrayProof = TokenInformationArrayProof;
class IpfsCID extends (0, o1js_pack_1.MultiPackedStringFactory)(2) {
}
exports.IpfsCID = IpfsCID;
// Tokens is the CircuitString.hash().
class Doot extends o1js_1.SmartContract {
    constructor() {
        super(...arguments);
        this.commitment = (0, o1js_1.State)();
        this.ipfsCID = (0, o1js_1.State)();
        this.owner = (0, o1js_1.State)();
        this.offchainStateCommitments = exports.offchainState.emptyCommitments();
        this.offchainState = exports.offchainState.init(this);
    }
    init() {
        super.init();
    }
    /// Can only be called once
    async initBase(updatedCommitment, updatedIpfsCID, informationArray) {
        this.commitment.getAndRequireEquals();
        this.ipfsCID.getAndRequireEquals();
        this.owner.getAndRequireEquals();
        this.owner.requireEquals(o1js_1.PublicKey.empty());
        this.commitment.set(updatedCommitment);
        this.ipfsCID.set(updatedIpfsCID);
        this.owner.set(this.sender.getAndRequireSignature());
        const lastPriceInformation = await this.offchainState.fields.tokenInformation.get((0, o1js_1.Field)(0));
        this.offchainState.fields.tokenInformation.update((0, o1js_1.Field)(0), {
            from: lastPriceInformation,
            to: informationArray,
        });
    }
    async update(updatedCommitment, updatedIpfsCID, informationArray) {
        this.commitment.getAndRequireEquals();
        this.ipfsCID.getAndRequireEquals();
        this.owner.getAndRequireEquals();
        this.owner.requireEquals(this.sender.getAndRequireSignature());
        this.commitment.set(updatedCommitment);
        this.ipfsCID.set(updatedIpfsCID);
        const lastPriceInformation = await this.offchainState.fields.tokenInformation.get((0, o1js_1.Field)(0));
        this.offchainState.fields.tokenInformation.update((0, o1js_1.Field)(0), {
            from: lastPriceInformation,
            to: informationArray,
        });
    }
    async getPrices() {
        return (await this.offchainState.fields.tokenInformation.get((0, o1js_1.Field)(0)))
            .value;
    }
    async settle(proof) {
        await this.offchainState.settle(proof);
    }
    async verify(signature, deployer, Price) {
        const validSignature = signature.verify(deployer, [Price]);
        validSignature.assertTrue();
    }
}
exports.Doot = Doot;
__decorate([
    (0, o1js_1.state)(o1js_1.Field),
    __metadata("design:type", Object)
], Doot.prototype, "commitment", void 0);
__decorate([
    (0, o1js_1.state)(IpfsCID),
    __metadata("design:type", Object)
], Doot.prototype, "ipfsCID", void 0);
__decorate([
    (0, o1js_1.state)(o1js_1.PublicKey),
    __metadata("design:type", Object)
], Doot.prototype, "owner", void 0);
__decorate([
    (0, o1js_1.state)(OffchainState.Commitments),
    __metadata("design:type", Object)
], Doot.prototype, "offchainStateCommitments", void 0);
__decorate([
    o1js_1.method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [o1js_1.Field,
        IpfsCID,
        TokenInformationArray]),
    __metadata("design:returntype", Promise)
], Doot.prototype, "initBase", null);
__decorate([
    o1js_1.method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [o1js_1.Field,
        IpfsCID,
        TokenInformationArray]),
    __metadata("design:returntype", Promise)
], Doot.prototype, "update", null);
__decorate([
    o1js_1.method.returns(TokenInformationArray),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Doot.prototype, "getPrices", null);
__decorate([
    o1js_1.method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TokenInformationArrayProof]),
    __metadata("design:returntype", Promise)
], Doot.prototype, "settle", null);
__decorate([
    o1js_1.method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [o1js_1.Signature,
        o1js_1.PublicKey,
        o1js_1.Field]),
    __metadata("design:returntype", Promise)
], Doot.prototype, "verify", null);
