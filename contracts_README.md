# Doot Oracle Protocol - Smart Contract Documentation

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Deployment Journey](#deployment-journey)
- [Contract Specifications](#contract-specifications)
- [Development Guide](#development-guide)
- [Security Considerations](#security-considerations)
- [Deployment Guide](#deployment-guide)

---

## 🔍 Overview

**Doot Oracle** is a minimalist yet powerful cryptocurrency price oracle system built on Mina Protocol and deployed on Zeko L2. The system provides cryptographically verified price feeds with zero-knowledge proofs for data integrity and off-chain storage optimization, optimized for the 8 Field state variable constraint.

### Core Features

- **Minimalist Design**: Optimized for Mina's 8 Field state limit
- **Cryptographically Verified Price Feeds**: ZK-SNARK proofs ensure data integrity
- **Off-chain State Management**: Scalable storage using Mina's OffchainState
- **IPFS Integration**: Decentralized data availability and historical records
- **Price Aggregation**: ZkPrograms for mathematical proof verification
- **Source Code Transparency**: Registry contract for implementation tracking
- **Zeko L2 Optimized**: Fast finality (~5 seconds) with low fees

### Tech Stack

- **Framework**: o1js 2.9.0 (Mina Protocol zkApp framework)
- **Language**: TypeScript 5.7.2
- **Network**: Zeko L2 Devnet (https://devnet.zeko.io/graphql)
- **Explorer**: ZekoScan (https://zekoscan.io/testnet)
- **Storage**: Off-chain state + IPFS
- **Testing**: Jest 29.7.0
- **Build**: tsc with ES modules

### Current Deployment

- **Network**: Zeko L2 Devnet
- **Doot Contract**: `B62qp1HAN4DhUa2x9pDLT5pR2FBHAbDRZ32o4japp9HJigHoBKfy6iR`
- **Owner**: `B62qod2DugDjy9Jxhzd56gFS7npN8pWhanxxb36MLPzDDqtzzDyBy5z`
- **Explorer**: https://zekoscan.io/testnet/account/B62qp1HAN4DhUa2x9pDLT5pR2FBHAbDRZ32o4japp9HJigHoBKfy6iR

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Doot Oracle   │    │    Registry     │    │   Aggregation   │
│   (Main Feed)   │    │  (Governance)   │    │  (Verification) │
│   4 Fields      │    │   6 Fields      │    │    1 Field      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Off-chain State │    │ Source Tracking │    │   ZkPrograms    │
│   (Scalable)    │    │ GitHub/IPFS     │    │  (20/100 batch) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐
                    │  IPFS Storage   │
                    │ (Data Archive)  │
                    └─────────────────┘
```

### Field Allocation Strategy

The system is designed around Mina's **8 Field state variable limit**:

- **Doot Oracle**: 4 Fields (commitment, ipfsCID[2], owner)
- **Registry**: 6 Fields (githubLink[2], ipfsLink[2], implementation, owner)
- **Aggregation**: 1 Field (totalVerifications)

### Data Flow

1. **External Price Feeds** → Oracle Backend
2. **Oracle Backend** → Doot Contract (with ZK proofs)
3. **Doot Contract** → Off-chain State Update
4. **Settlement Proof** → IPFS Storage (5-6 minutes)
5. **Aggregation ZkPrograms** → Price Verification
6. **Registry Contract** → Source Code Tracking

---

## 🚀 Deployment Journey

### The Challenge: Field Limit Discovery

Our deployment journey revealed the critical **8 Field state variable constraint** in Mina Protocol smart contracts. This limit exists because:

- Each Field element represents 255 bits of data
- Circuit constraints grow exponentially with state size
- 8 Fields is the optimal balance for proof generation efficiency vs. functionality

### Major Errors Encountered & Solutions

#### 1. **State Variable Overflow (9 → 8 Fields)**

**Problem**: Original Registry contract exceeded the limit

```typescript
// FAILED: 9 Fields total
@state(SourceCodeGithub) githubSourceLink;    // 2 Fields (MultiPackedStringFactory)
@state(SourceCodeIPFS) ipfsSourceLink;        // 2 Fields (MultiPackedStringFactory)
@state(PublicKey) implementation;             // 1 Field
@state(PublicKey) owner;                      // 1 Field
@state(Bool) frozen;                          // 1 Field
@state(UInt64) version;                       // 1 Field
@state(UInt64) upgradeCount;                  // 1 Field
```

**Solution**: Stripped to essentials (6 Fields)

```typescript
// SUCCESS: 6 Fields total
@state(SourceCodeGithub) githubSourceLink;    // 2 Fields
@state(SourceCodeIPFS) ipfsSourceLink;        // 2 Fields
@state(PublicKey) implementation;             // 1 Field
@state(PublicKey) owner;                      // 1 Field
```

**Key Insight**: `MultiPackedStringFactory(2)` uses 2 Field elements, not 1!

#### 2. **Zeko L2 Fee Dynamics**

**Problem**:

```
Error: Fee 10000000 provided is insufficient. Mina needed: 33266000.
```

**Root Cause**: Zeko uses dynamic fee calculation based on:

- Transaction complexity (number of constraints)
- Network congestion
- Proof verification costs

**Solution**: Increased fees from 0.01 MINA to 0.1 MINA for deployment buffer

#### 3. **GraphQL API Differences**

**Problem**:

```javascript
await deployResponse.wait(); // Method doesn't exist on Zeko
```

**Root Cause**: Zeko L2 has simplified GraphQL schema for fast finality

**Solution**: Manual timeout replacement

```javascript
// Mina L1
await deployResponse.wait();

// Zeko L2
await new Promise((resolve) => setTimeout(resolve, 6000));
```

#### 4. **Off-chain State Race Condition**

**Problem**: Root mismatch error when reading prices immediately after deployment

**Root Cause**: Settlement proof generation takes 5-6 minutes, but we tried reading state immediately

**Solution**: Graceful error handling

```javascript
try {
  let allPrices = await dootZkApp.getPrices();
} catch (error) {
  console.log(
    "⚠️ Off-chain state read failed (expected during proof generation)"
  );
}
```

#### 5. **Key Management Confusion**

**Problem**: Unclear separation of deployment vs operational keys

**Solution**: Clear role definition

- **DEPLOYER_PK**: Pays gas fees for deployment
- **DOOT_CALLER_PK**: Becomes oracle owner (operational)
- **Contract PK**: Generated fresh each deployment

### Performance Characteristics

- **Compilation Time**: 153 seconds (o1js circuit generation)
- **Deployment Time**: 1.16 seconds (Zeko fast finality)
- **Settlement Proof**: 5-6 minutes (off-chain state batching)
- **Total Deployment**: ~8 minutes (well under 15m timeout)

---

## 📚 Contract Specifications

### 🔮 Doot Contract (`src/contracts/Doot.ts`)

**Purpose**: Minimalist cryptocurrency price oracle with off-chain state management.

#### State Variables (4 Fields Total)

```typescript
@state(Field) commitment = State<Field>();                    // 1 Field - Merkle root
@state(IpfsCID) ipfsCID = State<IpfsCID>();                  // 2 Fields - IPFS hash
@state(PublicKey) owner = State<PublicKey>();                // 1 Field - Oracle operator
@state(OffchainState.Commitments) offchainStateCommitments;  // 0 Fields - Managed separately
```

#### Core Data Structure

**TokenInformationArray** (Simplified)

```typescript
export class TokenInformationArray extends Struct({
  prices: Provable.Array(Field, 10), // 10 cryptocurrency prices only
}) {}
```

**Supported Cryptocurrencies (10 tokens)**:

1. Mina Protocol (MINA)
2. Bitcoin (BTC)
3. Ethereum (ETH)
4. Solana (SOL)
5. Ripple (XRP)
6. Cardano (ADA)
7. Avalanche (AVAX)
8. Polygon (MATIC)
9. Chainlink (LINK)
10. Dogecoin (DOGE)

#### Methods

**1. `initBase(updatedCommitment, updatedIpfsCID, informationArray)`**

- **Purpose**: One-time oracle initialization
- **Access**: Anyone (first caller becomes owner)
- **Parameters**:
  - `updatedCommitment: Field` - Merkle root of price data
  - `updatedIpfsCID: IpfsCID` - IPFS hash for historical data
  - `informationArray: TokenInformationArray` - Initial 10 token prices
- **Constraints**:
  - Contract must be uninitialized (`owner == PublicKey.empty()`)
  - Sets caller as owner via `this.sender.getAndRequireSignature()`
- **Effects**:
  - Initializes on-chain state
  - Updates off-chain state with price data
  - Commits IPFS hash for historical reference

**2. `update(updatedCommitment, updatedIpfsCID, informationArray)`**

- **Purpose**: Update oracle prices (owner-only operation)
- **Access**: Owner only (signature verification)
- **Parameters**: Same as `initBase`
- **Validation**:
  - Owner authentication: `this.owner.requireEquals(this.sender.getAndRequireSignature())`
  - All price values implicitly validated by circuit constraints
- **Effects**:
  - Updates Merkle commitment
  - Updates IPFS hash
  - Queues off-chain state update

**3. `getPrices()`**

- **Purpose**: Retrieve current price data from off-chain state
- **Access**: Public (read-only)
- **Returns**: `TokenInformationArray` - Current 10 token prices
- **Note**: May fail during settlement proof generation (5-6 minute window)

**4. `settle(proof)`**

- **Purpose**: Commit off-chain state proof on-chain
- **Access**: Public
- **Parameters**: `proof: TokenInformationArrayProof` - Settlement proof
- **Process**:
  - Validates proof cryptographically
  - Commits batched off-chain updates
  - Enables reliable state reads

**5. `verify(signature, deployer, price)`**

- **Purpose**: Verify external price signatures (future ECDSA integration)
- **Access**: Public
- **Parameters**:
  - `signature: Signature` - Price data signature
  - `deployer: PublicKey` - Signer's public key
  - `price: Field` - Price value to verify
- **Validation**: ECDSA signature verification against price data

#### Off-chain State Integration

```typescript
export const offchainState = OffchainState(
  {
    tokenInformation: OffchainState.Map(Field, TokenInformationArray),
  },
  { maxActionsPerUpdate: 2 }
);
```

**Benefits**:

- **Scalability**: Unlimited off-chain storage
- **Cost Efficiency**: Only commitment stored on-chain
- **Batching**: Multiple updates settled in single proof
- **Historical Data**: Full price history via IPFS

### 📋 Registry Contract (`src/contracts/Registry.ts`)

**Purpose**: Source code transparency and implementation tracking for the Doot Oracle system.

#### State Variables (6 Fields Total)

```typescript
@state(SourceCodeGithub) githubSourceLink = State<SourceCodeGithub>();  // 2 Fields
@state(SourceCodeIPFS) ipfsSourceLink = State<SourceCodeIPFS>();        // 2 Fields
@state(PublicKey) implementation = State<PublicKey>();                  // 1 Field
@state(PublicKey) owner = State<PublicKey>();                          // 1 Field
```

#### String Storage Optimization

```typescript
// Efficient string storage using o1js-pack
export class SourceCodeGithub extends MultiPackedStringFactory(2) {} // ~64 chars
export class SourceCodeIPFS extends MultiPackedStringFactory(2) {} // ~64 chars
```

**Storage Capacity**:

- Each Field: ~31 characters efficiently
- 2 Fields: ~64 characters (sufficient for GitHub URLs and IPFS hashes)

#### Methods

**1. `initBase()`**

- **Purpose**: One-time registry initialization
- **Access**: Anyone (first caller becomes owner)
- **Validation**: Registry must be uninitialized
- **Effects**: Sets caller as owner

**2. `upgrade(updatedGithubLink, updatedIPFSLink, updatedImplementation)`**

- **Purpose**: Update registry with new implementation and source links
- **Access**: Owner only
- **Parameters**:
  - `updatedGithubLink: SourceCodeGithub` - GitHub repository URL
  - `updatedIPFSLink: SourceCodeIPFS` - IPFS backup of source code
  - `updatedImplementation: PublicKey` - New implementation contract address
- **Validation**:
  - Owner signature verification
  - Implementation address must differ (prevents no-op upgrades)
- **Effects**:
  - Updates all source links
  - Updates implementation reference
  - Provides full upgrade transparency

#### Example Usage

```typescript
// Initialize registry
await registry.initBase();

// Update with new implementation
await registry.upgrade(
  SourceCodeGithub.fromString("https://github.com/Doot/protocol-v2"),
  SourceCodeIPFS.fromString("QmNewSourceCodeHash123456789"),
  newImplementationAddress
);
```

### 🔢 Aggregation System (`src/contracts/Aggregation.ts`)

**Purpose**: ZkPrograms for price aggregation with mathematical proof verification.

#### State Variables (1 Field Total)

```typescript
export class VerifyAggregationProofGenerated extends SmartContract {
  // Minimal state for gas efficiency
  // No state variables - stateless verification
}
```

#### Core Data Structures

**PriceAggregationArray20**

```typescript
export class PriceAggregationArray20 extends Struct({
  pricesArray: Provable.Array(UInt64, 20),
  count: UInt64,
}) {
  constructor(value: { pricesArray: UInt64[]; count: UInt64 }) {
    super(value);
    // Auto-padding to exactly 20 elements
    while (value.pricesArray.length < 20) {
      value.pricesArray.push(UInt64.from(0));
    }
    if (value.pricesArray.length > 20) {
      value.pricesArray = value.pricesArray.slice(0, 20);
    }
  }
}
```

**PriceAggregationArray100**

```typescript
export class PriceAggregationArray100 extends Struct({
  pricesArray: Provable.Array(UInt64, 100),
  count: UInt64,
}) {}
```

#### ZkPrograms

**AggregationProgram20** - Optimized for 20 price points

```typescript
export const AggregationProgram20 = ZkProgram({
  name: "doot-prices-aggregation-program20",
  publicInput: PriceAggregationArray20,
  publicOutput: UInt64,

  methods: {
    base: {
      privateInputs: [],
      async method(publicInput: PriceAggregationArray20) {
        let currentSum: UInt64 = UInt64.from(0);
        for (let i = 0; i < 20; i++) {
          currentSum = currentSum.add(publicInput.pricesArray[i]);
        }
        return { publicOutput: currentSum.div(publicInput.count) };
      },
    },

    step: {
      privateInputs: [SelfProof],
      async method(
        publicInput: PriceAggregationArray20,
        privateInput: SelfProof
      ) {
        privateInput.verify();
        // Recursive aggregation logic
        let currentSum: UInt64 = UInt64.from(0);
        for (let i = 0; i < 20; i++) {
          currentSum = currentSum.add(publicInput.pricesArray[i]);
        }
        return { publicOutput: currentSum.div(publicInput.count) };
      },
    },
  },
});
```

**AggregationProgram100** - For larger datasets

- Similar structure but optimized for 100 price points
- Higher constraint count but more comprehensive aggregation

#### Verification Contract

**VerifyAggregationProofGenerated**

```typescript
@method async verifyAggregationProof20(proof: AggregationProof20) {
  proof.verify();
}

@method async verifyAggregationProof100(proof: AggregationProof100) {
  proof.verify();
}
```

**Usage Example**:

```typescript
// Generate aggregation proof
const priceArray = new PriceAggregationArray20({
  pricesArray: [
    /* 20 prices */
  ],
  count: UInt64.from(20),
});

const { proof } = await AggregationProgram20.base(priceArray);

// Verify on-chain
await verifier.verifyAggregationProof20(proof);
```

#### Auto-Compilation

```typescript
await AggregationProgram100.compile();
await AggregationProgram20.compile();
```

Both programs are compiled at import time for immediate availability.

---

## 🛠️ Development Guide

### Build Commands

```bash
# Install dependencies
npm install

# Build contracts (includes compilation and type checking)
npm run build

# Watch build (development mode)
npm run buildw

# Run all tests
npm run test

# Run specific contract tests
npm run test:doot
npm run test:registry
npm run test:aggregation

# Lint and format
npm run lint
npm run format

# Deploy to different networks
npm run deploy:doot          # Local deployment
npm run deploy:registry      # Local deployment
npm run deploy:aggregation   # Local deployment

# Zeko L2 deployments
node build/src/deploy/zeko_doot_main.js
node build/src/deploy/zeko_registry_main.js
node build/src/deploy/zeko_aggregation_main.js
```

### Environment Setup

**.env Configuration**:

```bash
# Deployment keys (fund these addresses on target network)
DEPLOYER_PK=
DOOT_CALLER_PK=

# Verification and registry keys
VERIFICATION_PK=
REGISTRY_PK=

# Contract key (generated during deployment)
DOOT_PK=
```

### Testing Strategy

**Unit Tests**

- Individual contract method testing
- State transition validation
- Access control verification
- Field limit compliance testing

**Integration Tests**

- Cross-contract interactions
- Off-chain state settlement
- ZkProgram proof verification
- End-to-end price update flows

**Zeko L2 Tests**

- Network-specific deployment
- Fee estimation validation
- GraphQL API differences
- Performance benchmarking

### Project Structure

```
src/
├── contracts/
│   ├── Doot.ts              # Main oracle contract (4 Fields)
│   ├── Registry.ts          # Source transparency (6 Fields)
│   ├── Aggregation.ts       # Price aggregation (1 Field)
│   ├── Doot.test.ts         # Doot contract tests
│   ├── Registry.test.ts     # Registry contract tests
│   └── Aggregation.test.ts  # Aggregation tests
├── deploy/
│   ├── doot_main.ts         # Local Doot deployment
│   ├── registry_main.ts     # Local Registry deployment
│   ├── aggregation_main.ts  # Local Aggregation deployment
│   ├── zeko_doot_main.ts    # Zeko L2 Doot deployment
│   ├── zeko_registry_main.ts # Zeko L2 Registry deployment
│   ├── zeko_aggregation_main.ts # Zeko L2 Aggregation deployment
│   ├── key_generator.ts     # Single key generation
│   └── multi_key_generator.ts # Multiple key generation
└── index.ts                 # Main exports
```

---

## 🔐 Security Considerations

### Field Limit Constraints

1. **Strict Field Counting**: Always verify total Fields before deployment
2. **MultiPackedStringFactory**: Remember 2-Field cost for string storage
3. **State Minimalism**: Prefer off-chain state for complex data

### Access Control Patterns

1. **Owner-only functions** with signature verification
2. **Initialization protection** (single-call initialization)
3. **No pause mechanisms** (removed for simplicity)
4. **Upgrade transparency** via Registry contract

### Input Validation

1. **Implicit validation** through circuit constraints
2. **Signature verification** for external data sources
3. **Proof verification** for ZkProgram outputs
4. **Off-chain state integrity** through settlement proofs

### Economic Security

1. **Price manipulation resistance** through aggregation
2. **Historical data integrity** via IPFS pinning
3. **Merkle commitment schemes** for tamper evidence
4. **Settlement proof requirements** for state reads

### Network-Specific Risks

1. **Zeko L2 finality** (~5 seconds vs Mina's 2-3 minutes)
2. **Dynamic fee structures** requiring buffer margins
3. **GraphQL API differences** between networks
4. **Key management** across deployment vs operational roles

---

## 🚀 Deployment Guide

### Network Configuration

**Zeko L2 Devnet**:

```typescript
const ZEKO_DEVNET_ENDPOINT = "https://devnet.zeko.io/graphql";
const ZEKO_EXPLORER = "https://zekoscan.io/testnet";

const ZekoNetwork = Mina.Network({
  mina: ZEKO_DEVNET_ENDPOINT,
  archive: ZEKO_DEVNET_ENDPOINT,
});
```

### Deployment Sequence

1. **Environment Setup**

   ```bash
   # Generate keys if needed
   node build/src/deploy/multi_key_generator.js 3

   # Fund deployer and oracle operator addresses on target network
   ```

2. **Contract Compilation & Deployment**

   ```bash
   # Build contracts
   npm run build

   # Deploy to Zeko L2 (15-minute timeout recommended)
   timeout 15m node build/src/deploy/zeko_doot_main.js
   timeout 15m node build/src/deploy/zeko_registry_main.js
   timeout 15m node build/src/deploy/zeko_aggregation_main.js
   ```

3. **Post-Deployment Verification**
   ```bash
   # Verify deployment on ZekoScan
   # Test price updates
   # Confirm off-chain state settlement
   ```

### Deployment Performance Expectations

| Phase       | Duration         | Notes                               |
| ----------- | ---------------- | ----------------------------------- |
| Compilation | 150-200s         | Circuit generation and optimization |
| Deployment  | 1-5s             | Zeko L2 fast finality               |
| Settlement  | 300-400s         | Off-chain state proof generation    |
| **Total**   | **8-10 minutes** | Well under 15m timeout              |

### Fee Estimation

- **Deployment**: 0.1 MINA (buffer for dynamic pricing)
- **Price Updates**: 0.1 MINA (includes settlement)
- **Registry Updates**: 0.1 MINA
- **Aggregation Verification**: 0.1 MINA

### Production Checklist

- [ ] All contracts compiled with correct Field counts
- [ ] Keys properly secured and environment configured
- [ ] Registry populated with correct GitHub/IPFS sources
- [ ] Settlement proofs tested and verified
- [ ] Price update flows tested end-to-end
- [ ] Monitoring configured for contract states
- [ ] Backup procedures for IPFS data established
- [ ] Emergency procedures documented
- [ ] Performance benchmarks established

### Current Live Deployment

**Zeko L2 Devnet Deployment (January 2025)**:

```
Network:     Zeko L2 Devnet
Contract:    B62qp1HAN4DhUa2x9pDLT5pR2FBHAbDRZ32o4japp9HJigHoBKfy6iR
Owner:       B62qod2DugDjy9Jxhzd56gFS7npN8pWhanxxb36MLPzDDqtzzDyBy5z
Explorer:    https://zekoscan.io/testnet/account/B62qp1HAN4DhUa2x9pDLT5pR2FBHAbDRZ32o4japp9HJigHoBKfy6iR

Deployment Transactions:
- Deploy:    5JtaqqGrkTp62KXmqxMzMuEAtagttgnMexjzTnD7oFEhg3mMp6xT
- Init:      5JuzDqNkMXHtcjtPUVJe9VXRtMHNjwVj5DjXXXTPdEV6BNKmRWox
- Settlement: 5JvAr9LBGzWzHtKgHM33AvnNLRJ4k9hWuSp334yqnba8EiS3ktr1

Performance Metrics:
- Compilation: 153 seconds
- Deployment: 1.16 seconds
- Settlement: ~300 seconds
- Total: 8 minutes
```

---

## 📊 Key Performance Metrics

### Constraint Counts (Optimized)

- **Doot.initBase()**: ~10,000 constraints (reduced from 15,000)
- **Doot.update()**: ~8,000 constraints (reduced from 12,000)
- **Registry.upgrade()**: ~5,000 constraints
- **AggregationProgram20.base()**: ~6,000 constraints
- **AggregationProgram100.base()**: ~20,000 constraints

### Proof Generation Times (Local Machine)

- **20-point aggregation**: ~3-8 seconds
- **100-point aggregation**: ~15-30 seconds
- **Contract deployments**: ~1-3 seconds
- **Settlement proofs**: ~5-6 minutes

### Storage Efficiency

- **On-chain state**: 4-6 Fields per contract (within 8 Field limit)
- **Off-chain state**: Unlimited scalability via OffchainState
- **IPFS storage**: Permanent historical archive
- **String storage**: ~64 characters per 2-Field allocation

### Network Performance (Zeko L2)

- **Transaction finality**: ~5 seconds
- **Fee predictability**: Dynamic but reasonable with 0.1 MINA buffer
- **GraphQL responsiveness**: Fast, simplified API
- **Explorer integration**: ZekoScan provides full transaction details

---

## 🔗 Integration Examples

### Price Update Flow

```typescript
// 1. Prepare price data (10 cryptocurrencies)
const tokenInfo = new TokenInformationArray({
  prices: [
    Field.from(1848770935), // Mina: ~$0.18
    Field.from(1115439169547040), // Bitcoin: ~$111,543
    Field.from(44421115510507), // Ethereum: ~$4,442
    Field.from(2001398311039), // Solana: ~$200
    Field.from(4749419511), // Ripple: ~$0.47
    Field.from(3907233838), // Cardano: ~$0.39
    Field.from(278604715977), // Avalanche: ~$27.8
    Field.from(5645415935), // Polygon: ~$0.56
    Field.from(243095980879), // Chainlink: ~$24.3
    Field.from(1261024335), // Dogecoin: ~$0.12
  ],
});

// 2. Update oracle (owner only)
await doot.update(merkleRoot, ipfsCID, tokenInfo);

// 3. Settle off-chain state (5-6 minute process)
const proof = await doot.offchainState.createSettlementProof();
await doot.settle(proof);

// 4. Verify prices are readable
try {
  const currentPrices = await doot.getPrices();
  console.log("Mina price:", currentPrices.prices[0].toString());
} catch (error) {
  console.log("Settlement still in progress...");
}
```

### Registry Management

```typescript
// 1. Initialize registry
await registry.initBase();

// 2. Update with implementation details
await registry.upgrade(
  SourceCodeGithub.fromString("https://github.com/Doot/protocol"),
  SourceCodeIPFS.fromString("QmSourceCodeHash123456789"),
  newImplementationAddress
);

// 3. Read source information
const githubUrl = SourceCodeGithub.unpack(
  registry.githubSourceLink.get().packed
)
  .map((x) => x.toString())
  .join("");
console.log("Source code:", githubUrl);
```

### Aggregation Verification

```typescript
// 1. Prepare price array for aggregation
const priceArray = new PriceAggregationArray20({
  pricesArray: [
    /* 20 UInt64 values */
  ],
  count: UInt64.from(20),
});

// 2. Generate aggregation proof
const { proof } = await AggregationProgram20.base(priceArray);

// 3. Verify proof on-chain
await verifier.verifyAggregationProof20(proof);
console.log("Average price:", proof.publicOutput.toString());
```

---

## 📝 Lessons Learned

### Technical Insights

1. **Field Counting is Critical**: MultiPackedStringFactory classes consume 2 Fields each
2. **Zeko L2 Differences**: Simplified APIs, dynamic fees, fast finality
3. **Off-chain State Complexity**: Settlement proofs take significant time but enable scalability
4. **Minimalist Design**: Less is more in ZK development due to constraint limitations

### Development Best Practices

1. **Start Simple**: Begin with minimal viable contracts, add complexity gradually
2. **Test Field Limits**: Always verify state variable Field count before deployment
3. **Buffer Fees**: Use 0.1 MINA minimum for Zeko L2 deployments
4. **Handle Async State**: Off-chain state reads may fail during settlement
5. **Document Everything**: ZK development has many gotchas requiring documentation

### Production Recommendations

1. **Monitor Settlement**: Track off-chain state settlement completion
2. **IPFS Reliability**: Ensure multiple IPFS nodes pin historical data
3. **Fee Management**: Monitor Zeko fee dynamics for optimization
4. **Upgrade Planning**: Use Registry contract for transparent implementation tracking
5. **Performance Testing**: Benchmark proof generation times on target hardware

---

**Last Updated**: January 2025
**o1js Version**: 2.9.0
**Contract Version**: 0.3.0 (Minimalist)
**Network**: Zeko L2 Devnet
**Deployment Status**: Live and Operational
