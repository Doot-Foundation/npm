# Doot Oracle Client

Get real-time cryptocurrency prices with zero-knowledge proofs on the Mina blockchain.

## What is Doot?

Doot provides verified price data for 10 major cryptocurrencies using zero-knowledge proofs. Your app gets fast, reliable prices with automatic fallback across multiple sources.

## Quick Start

```bash
npm install @dootfoundation/client
```

```javascript
import { Client } from '@dootfoundation/client';

const client = new Client('your-api-key');
const price = await client.getData('bitcoin');

console.log(`Bitcoin: $${price.price_data.price}`);
```

## zkApp-CLI Usage

When using in zkApp-CLI projects, you may need to add `@ts-ignore` for TypeScript compilation:

```typescript
import dotenv from 'dotenv';
dotenv.config();

// @ts-ignore
import { Client } from '@dootfoundation/client';

const client = new Client(process.env.DOOT_API_KEY);
const price = await client.getData('bitcoin');
```

This is only a TypeScript compilation issue - the package works perfectly at runtime in zkApp-CLI environments.

## Supported Tokens

- `bitcoin` - Bitcoin (BTC)
- `ethereum` - Ethereum (ETH)
- `mina` - Mina Protocol (MINA)
- `solana` - Solana (SOL)
- `chainlink` - Chainlink (LINK)
- `ripple` - XRP (XRP)
- `dogecoin` - Dogecoin (DOGE)
- `polygon` - Polygon (MATIC)
- `avalanche` - Avalanche (AVAX)
- `cardano` - Cardano (ADA)

## How It Works

Doot uses a 3-layer fallback system:

1. **API** (fastest, ~100ms) - Direct from Doot servers
2. **L2** (fast, ~10-30s) - Zeko Layer 2 blockchain
3. **L1** (secure, ~30-60s) - Mina mainnet blockchain

If one source fails, it automatically tries the next one.

## API Methods

### `getData(token)`
Smart fallback through all sources (recommended)
```javascript
const price = await client.getData('ethereum');
```

### `getFromAPI(token)`
Get price directly from API (requires valid key)
```javascript
const price = await client.getFromAPI('bitcoin');
```

### `getFromL2(token)`
Get price from Zeko L2 blockchain
```javascript
const price = await client.getFromL2('solana');
```

### `getFromL1(token)`
Get price from Mina L1 blockchain
```javascript
const price = await client.getFromL1('mina');
```

### `isKeyValid()`
Check if your API key works
```javascript
const valid = await client.isKeyValid();
```

### `validtokens`
List of supported tokens
```javascript
import { validtokens } from '@dootfoundation/client';
console.log(validtokens); // ['bitcoin', 'ethereum', ...]
```

## Response Format

All methods return the same format:

```javascript
{
  source: 'API',           // Which source provided the data
  fromAPI: true,           // Boolean flags for source
  fromL2: false,
  fromL1: false,
  price_data: {
    token: 'bitcoin',
    price: '65432.12',     // Price as string
    decimals: '10',        // Decimal places
    aggregationTimestamp: '1640995200000',
    signature: 'ABC123...', // ZK proof signature
    oracle: 'B62q...'      // Oracle public key
  },
  proof_data: '{...}'      // Zero-knowledge proof data
}
```

## Get an API Key

1. Visit [doot.foundation/dashboard](https://doot.foundation/dashboard)
2. Sign up for a free account
3. Generate your API key
4. Start building!

## Examples

### Basic Price Fetching
```javascript
import { Client } from '@dootfoundation/client';

const client = new Client('your-api-key');

// Get Bitcoin price with fallback
const btc = await client.getData('bitcoin');
console.log(`BTC: $${btc.price_data.price}`);

// Get multiple prices
const tokens = ['bitcoin', 'ethereum', 'solana'];
for (const token of tokens) {
  const price = await client.getData(token);
  console.log(`${token}: $${price.price_data.price}`);
}
```

### Using in a Trading Bot
```javascript
import { Client } from '@dootfoundation/client';

const client = new Client(process.env.DOOT_API_KEY);

async function checkPrices() {
  try {
    const eth = await client.getData('ethereum');
    const btc = await client.getData('bitcoin');

    const ethPrice = parseFloat(eth.price_data.price);
    const btcPrice = parseFloat(btc.price_data.price);

    console.log(`ETH/BTC ratio: ${(ethPrice / btcPrice).toFixed(4)}`);
  } catch (error) {
    console.error('Price fetch failed:', error.message);
  }
}

setInterval(checkPrices, 60000); // Check every minute
```

### Environment Variables
```bash
# .env file
DOOT_API_KEY=your-api-key-here
```

```javascript
import dotenv from 'dotenv';
dotenv.config();

const client = new Client(process.env.DOOT_API_KEY);
```

## Error Handling

```javascript
try {
  const price = await client.getData('bitcoin');
  console.log('Success:', price);
} catch (error) {
  if (error.message.includes('Invalid token')) {
    console.log('Token not supported');
  } else if (error.message.includes('401')) {
    console.log('Invalid API key');
  } else {
    console.log('Network or service error');
  }
}
```

## Requirements

- Node.js 18+
- Internet connection
- API key for fastest access (free at doot.foundation)

## No Setup Required

This package works in any Node.js environment. No special blockchain setup needed - just install and use!

## Support

- Documentation: [docs.doot.foundation](https://docs.doot.foundation)
- Issues: [GitHub Issues](https://github.com/Doot-Foundation/npm/issues)
- Website: [doot.foundation](https://doot.foundation)

## License

ISC License - see LICENSE.md file for details.