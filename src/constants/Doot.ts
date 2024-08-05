import {
  SmartContract,
  Field,
  method,
  State,
  state,
  PublicKey,
  Signature,
  Poseidon,
  Experimental,
  CircuitString,
  Struct,
  Provable,
} from "o1js";
import { MultiPackedStringFactory } from "o1js-pack";
const { OffchainState, OffchainStateCommitments } = Experimental;

export const offchainState = OffchainState({
  prices: OffchainState.Map(Field, Field),
});
export class PriceProof extends offchainState.Proof {}
export class IpfsCID extends MultiPackedStringFactory(2) {}

export class PricesArray extends Struct({
  prices: Provable.Array(Field, 10),
}) {}

export class Doot extends SmartContract {
  @state(Field) commitment = State<Field>();
  @state(Field) secret = State<Field>();
  @state(IpfsCID) ipfsCID = State<IpfsCID>();
  @state(PublicKey) deployerPublicKey = State<PublicKey>();
  @state(OffchainStateCommitments) offchainState = State(
    OffchainStateCommitments.empty()
  );

  init() {
    super.init();
    this.deployerPublicKey.set(this.sender.getUnconstrained());
  }

  @method async initBase(
    updatedCommitment: Field,
    updatedIpfsCID: IpfsCID,
    pricesArray: PricesArray,
    updatedSecret: Field
  ) {
    this.deployerPublicKey.getAndRequireEquals();
    this.secret.getAndRequireEquals();
    this.commitment.getAndRequireEquals();
    this.ipfsCID.getAndRequireEquals();

    /// Can only be called once
    this.secret.requireEquals(Field.from(0));

    this.commitment.set(updatedCommitment);
    this.ipfsCID.set(updatedIpfsCID);

    let lastPriceOption = await offchainState.fields.prices.get(
      CircuitString.fromString("Mina").hash()
    );
    offchainState.fields.prices.update(
      CircuitString.fromString("Mina").hash(),
      {
        from: lastPriceOption,
        to: pricesArray.prices[0],
      }
    );

    lastPriceOption = await offchainState.fields.prices.get(
      CircuitString.fromString("Bitcoin").hash()
    );
    offchainState.fields.prices.update(
      CircuitString.fromString("Bitcoin").hash(),
      {
        from: lastPriceOption,
        to: pricesArray.prices[1],
      }
    );
    lastPriceOption = await offchainState.fields.prices.get(
      CircuitString.fromString("Ethereum").hash()
    );
    offchainState.fields.prices.update(
      CircuitString.fromString("Ethereum").hash(),
      {
        from: lastPriceOption,
        to: pricesArray.prices[2],
      }
    );
    lastPriceOption = await offchainState.fields.prices.get(
      CircuitString.fromString("Solana").hash()
    );
    offchainState.fields.prices.update(
      CircuitString.fromString("Solana").hash(),
      {
        from: lastPriceOption,
        to: pricesArray.prices[3],
      }
    );
    lastPriceOption = await offchainState.fields.prices.get(
      CircuitString.fromString("Ripple").hash()
    );
    offchainState.fields.prices.update(
      CircuitString.fromString("Ripple").hash(),
      {
        from: lastPriceOption,
        to: pricesArray.prices[4],
      }
    );
    lastPriceOption = await offchainState.fields.prices.get(
      CircuitString.fromString("Cardano").hash()
    );
    offchainState.fields.prices.update(
      CircuitString.fromString("Cardano").hash(),
      {
        from: lastPriceOption,
        to: pricesArray.prices[5],
      }
    );
    lastPriceOption = await offchainState.fields.prices.get(
      CircuitString.fromString("Avalanche").hash()
    );
    offchainState.fields.prices.update(
      CircuitString.fromString("Avalanche").hash(),
      {
        from: lastPriceOption,
        to: pricesArray.prices[6],
      }
    );
    lastPriceOption = await offchainState.fields.prices.get(
      CircuitString.fromString("Polygon").hash()
    );
    offchainState.fields.prices.update(
      CircuitString.fromString("Polygon").hash(),
      {
        from: lastPriceOption,
        to: pricesArray.prices[7],
      }
    );
    lastPriceOption = await offchainState.fields.prices.get(
      CircuitString.fromString("Chainlink").hash()
    );
    offchainState.fields.prices.update(
      CircuitString.fromString("Chainlink").hash(),
      {
        from: lastPriceOption,
        to: pricesArray.prices[8],
      }
    );
    lastPriceOption = await offchainState.fields.prices.get(
      CircuitString.fromString("Dogecoin").hash()
    );
    offchainState.fields.prices.update(
      CircuitString.fromString("Dogecoin").hash(),
      {
        from: lastPriceOption,
        to: pricesArray.prices[9],
      }
    );

    this.secret.set(Poseidon.hash([updatedSecret]));
  }

  @method async update(
    updatedCommitment: Field,
    updatedIpfsCID: IpfsCID,
    pricesArray: PricesArray,
    secret: Field
  ) {
    this.deployerPublicKey.getAndRequireEquals();
    this.secret.getAndRequireEquals();
    this.commitment.getAndRequireEquals();
    this.ipfsCID.getAndRequireEquals();

    const sentSecret = Poseidon.hash([secret]);
    this.secret.requireEquals(sentSecret);

    let lastPriceOption = await offchainState.fields.prices.get(
      CircuitString.fromString("Mina").hash()
    );
    offchainState.fields.prices.update(
      CircuitString.fromString("Mina").hash(),
      {
        from: lastPriceOption,
        to: pricesArray.prices[0],
      }
    );
    lastPriceOption = await offchainState.fields.prices.get(
      CircuitString.fromString("Bitcoin").hash()
    );
    offchainState.fields.prices.update(
      CircuitString.fromString("Bitcoin").hash(),
      {
        from: lastPriceOption,
        to: pricesArray.prices[1],
      }
    );
    lastPriceOption = await offchainState.fields.prices.get(
      CircuitString.fromString("Ethereum").hash()
    );
    offchainState.fields.prices.update(
      CircuitString.fromString("Ethereum").hash(),
      {
        from: lastPriceOption,
        to: pricesArray.prices[2],
      }
    );
    lastPriceOption = await offchainState.fields.prices.get(
      CircuitString.fromString("Solana").hash()
    );
    offchainState.fields.prices.update(
      CircuitString.fromString("Solana").hash(),
      {
        from: lastPriceOption,
        to: pricesArray.prices[3],
      }
    );
    lastPriceOption = await offchainState.fields.prices.get(
      CircuitString.fromString("Ripple").hash()
    );
    offchainState.fields.prices.update(
      CircuitString.fromString("Ripple").hash(),
      {
        from: lastPriceOption,
        to: pricesArray.prices[4],
      }
    );
    lastPriceOption = await offchainState.fields.prices.get(
      CircuitString.fromString("Cardano").hash()
    );
    offchainState.fields.prices.update(
      CircuitString.fromString("Cardano").hash(),
      {
        from: lastPriceOption,
        to: pricesArray.prices[5],
      }
    );
    lastPriceOption = await offchainState.fields.prices.get(
      CircuitString.fromString("Avalanche").hash()
    );
    offchainState.fields.prices.update(
      CircuitString.fromString("Avalanche").hash(),
      {
        from: lastPriceOption,
        to: pricesArray.prices[6],
      }
    );
    lastPriceOption = await offchainState.fields.prices.get(
      CircuitString.fromString("Polygon").hash()
    );
    offchainState.fields.prices.update(
      CircuitString.fromString("Polygon").hash(),
      {
        from: lastPriceOption,
        to: pricesArray.prices[7],
      }
    );
    lastPriceOption = await offchainState.fields.prices.get(
      CircuitString.fromString("Chainlink").hash()
    );
    offchainState.fields.prices.update(
      CircuitString.fromString("Chainlink").hash(),
      {
        from: lastPriceOption,
        to: pricesArray.prices[8],
      }
    );
    lastPriceOption = await offchainState.fields.prices.get(
      CircuitString.fromString("Dogecoin").hash()
    );
    offchainState.fields.prices.update(
      CircuitString.fromString("Dogecoin").hash(),
      {
        from: lastPriceOption,
        to: pricesArray.prices[9],
      }
    );

    this.commitment.set(updatedCommitment);
    this.ipfsCID.set(updatedIpfsCID);
  }

  @method.returns(Field)
  async getPrice(token: CircuitString) {
    return (await offchainState.fields.prices.get(token.hash())).orElse(0n);
  }
  @method
  async settle(proof: PriceProof) {
    await offchainState.settle(proof);
  }

  @method async verify(signature: Signature, Price: Field) {
    this.deployerPublicKey.getAndRequireEquals();
    const validSignature = signature.verify(this.deployerPublicKey.get(), [
      Price,
    ]);
    validSignature.assertTrue();
  }
}
