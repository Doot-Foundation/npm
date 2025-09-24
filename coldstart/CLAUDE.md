# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **@doot-oracles/client** npm package - a TypeScript client library for accessing Doot Foundation's oracle data feeds on Mina Protocol. The package provides o1js-compatible cryptocurrency price feeds with zero-knowledge proofs for DeFi applications. It supports 10 major cryptocurrencies and requires an API key from https://doot.foundation.

## Development Commands

**Core Development Commands:**
- `npm run build` - Compile TypeScript to JavaScript in `dist/` directory
- `npm run build:watch` - Build in watch mode for development
- `npm run dev` - Alias for build:watch
- `npm start` - Run the compiled JavaScript from dist/index.js
- `npm run clean` - Remove the `dist/` build directory

**Testing Commands:**
- `npm test` - Run all Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

**Code Quality Commands:**
- `npm run lint` - Run ESLint on TypeScript files
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run typecheck` - Run TypeScript type checking without emitting files
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is properly formatted

**Package Management:**
- `npm run prepublishOnly` - Pre-publish validation (clean, build, test, lint)
- `npm run publish:npm` - Publish to npm registry
- `npm run version:patch|minor|major` - Version bump with git tags
- `npm run update-deps` - Update all dependencies to latest versions

## Architecture Overview

### Core Package Structure

**Client API (`src/Client.ts`)**
- Main export class providing oracle data access
- Dual-source architecture: API-first with blockchain fallback
- Supports 10 cryptocurrencies: mina, ethereum, solana, bitcoin, chainlink, ripple, dogecoin, polygon, avalanche, cardano
- Returns `ClientResultObject` with price data, timestamps, signatures, and ZK proofs
- Automatic fallback to direct Mina Protocol queries when API unavailable

**Smart Contract Integration (`src/constants/Doot.ts`)**
- o1js SmartContract using Experimental.OffchainState for scalable price storage
- Manages price feeds via offchain state mapping (Field -> Field)
- IPFS integration for data availability using `IpfsCID` multi-packed strings
- Secret-based authentication system for authorized updates
- Key methods: `initBase()`, `update()`, `getPrice()`, `settle()`, `verify()`

**Performance Optimization (`src/LoadCache.ts`)**
- Custom o1js Cache implementation for verification key management
- Reads precompiled artifacts from `utils/constants/cache/` directory
- Essential for fast contract compilation and proof generation
- Supports both header validation and binary data loading

### Oracle Data Flow

1. **API Request**: Client queries Doot Foundation API with Bearer token authentication
2. **Blockchain Fallback**: On API failure, connects directly to Mina devnet
3. **Contract Compilation**: Uses cached verification keys for performance
4. **Price Query**: Calls `getPrice()` method on deployed Doot zkApp
5. **Proof Generation**: Returns cryptographically signed price data with timestamps

### Key Design Patterns

**Resilient Data Access:**
- Primary: RESTful API (http://localhost:3000) with API key authentication
- Fallback: Direct blockchain queries via o1js and Mina GraphQL
- Ensures 99.9% uptime for price feed consumers

**Zero-Knowledge Oracle Architecture:**
- All price data cryptographically signed by oracle authority
- OffchainState enables unlimited price storage without on-chain constraints
- Proof settlement mechanism for batch verification
- IPFS commitment system for data availability guarantees

**NPM Package Best Practices:**
- CommonJS module output for maximum compatibility
- TypeScript declarations included in distribution
- Strict ESLint and Prettier configuration
- Comprehensive Jest test coverage requirements

## Development Environment

**Package Dependencies:**
- `o1js@^2.9.0` - Latest Mina Protocol ZK SDK
- `o1js-pack@^0.7.0` - String packing utilities for circuit optimization
- `axios@^1.7.7` - HTTP client for API communication

**Build Configuration:**
- TypeScript ES2020 target with CommonJS modules
- Strict type checking enabled
- Output directory: `dist/` with declaration files
- Node.js 18+ and npm 8+ minimum requirements

**Quality Assurance:**
- Jest with ts-jest preset for testing
- ESLint with TypeScript rules and Prettier integration
- Pre-commit hooks via prepublishOnly script
- Automated dependency updates with npm-check-updates

## Oracle Network Configuration

**Mina Protocol Integration:**
- Network: Mina Devnet (proxy.devnet.minaexplorer.com)
- Contract Address: `B62qoewPcZFiqZUYZgqjrkYH5irW7wamaB2izCC6wgHzjtgZFNjHg6p`
- Required cache files: `step-vk-doot-getprice`, `wrap-vk-doot`

**Supported Token List:**
All token names must be lowercase strings from the validated set:
mina, ethereum, solana, bitcoin, chainlink, ripple, dogecoin, polygon, avalanche, cardano