# @doot-oracles/client

A simple and reliable way to get cryptocurrency prices with zero-knowledge proofs for Mina Protocol applications.

## What does this do?

This package helps you get real-time cryptocurrency prices in three smart ways:

1. **API first** - Fast data from our backend server
2. **Zeko L2 fallback** - If API fails, get data from Zeko Layer 2 (fast blockchain)
3. **Mina L1 fallback** - If both fail, get data directly from Mina blockchain (most secure)

## Supported Cryptocurrencies

We support 10 major cryptocurrencies:

- Mina (MINA)
- Bitcoin (BTC)
- Ethereum (ETH)
- Solana (SOL)
- Ripple (XRP)
- Cardano (ADA)
- Avalanche (AVAX)
- Polygon (MATIC)
- Chainlink (LINK)
- Dogecoin (DOGE)

## Get Started

### 1. Get your API key

Visit [doot.foundation](https://doot.foundation/dashboard) to get your free API key.

### 2. Install the package

```bash
npm install @doot-oracles/client
```

### 3. Use it in your project

```javascript
import { Client } from '@doot-oracles/client';

// Create a client with your API key
const client = new Client('your-api-key-here');

// Get Bitcoin price (tries API → L2 → L1 automatically)
const bitcoinData = await client.getData('bitcoin');
console.log(`Bitcoin price: $${bitcoinData.price_data.price}`);
```

## How to use

### Basic Usage (Recommended)

The `getData()` method is smart - it tries to get data from the fastest source first, then falls back if needed:

```javascript
// This tries API first, then L2, then L1 if needed
const priceData = await client.getData('ethereum');

console.log('Price:', priceData.price_data.price);
console.log('Got data from:', priceData.source); // 'API', 'L2', or 'L1'
```

### Get data from specific sources

If you want to get data from a specific source, you can:

```javascript
// Get data from API only
const apiData = await client.getDataFromAPI('mina');

// Get data from Zeko L2 only
const l2Data = await client.getDataFromZekoL2('solana');

// Get data from Mina L1 only
const l1Data = await client.getDataFromMinaL1('cardano');
```

### Check if your API key works

```javascript
const isValid = await client.isKeyValid();
if (isValid) {
  console.log('API key is working!');
} else {
  console.log('API key is not valid');
}
```

### Backward compatibility

If you're upgrading from an older version, the old `Price()` method still works:

```javascript
// This works the same as getData()
const priceData = await client.Price('bitcoin');
```

## What you get back

Every method returns the same data structure:

```javascript
{
  fromAPI: true,     // Did data come from API?
  fromL2: false,     // Did data come from L2?
  fromL1: false,     // Did data come from L1?
  source: 'API',     // Which source was used: 'API', 'L2', or 'L1'

  price_data: {
    token: 'bitcoin',                    // Which cryptocurrency
    price: '1020123.45',                   // Current price
    decimals: '10',                      // Price precision
    aggregationTimestamp: '1672531200',  // When price was calculated
    signature: '...',                    // Cryptographic signature
    oracle: 'B62q...'                   // Oracle address
  },

  proof_data: '{...}'  // Zero-knowledge proof data
}
```

## Error handling

The package handles errors automatically, but you should still wrap calls in try-catch:

```javascript
try {
  const priceData = await client.getData('bitcoin');
  console.log('Success!', priceData.price_data.price);
} catch (error) {
  console.log('All sources failed:', error.message);
}
```

## Advanced: Understanding the fallback

Here's what happens when you call `getData()`:

1. **Try API first** (fastest, ~100ms)
   - If successful → return data
   - If fails → try step 2

2. **Try Zeko L2** (fast blockchain, ~5 seconds)
   - Connect to Zeko network
   - Read from smart contract
   - If successful → return data
   - If fails → try step 3

3. **Try Mina L1** (secure blockchain, ~30 seconds)
   - Connect to Mina network
   - Read from smart contract
   - If successful → return data
   - If fails → throw error

## Configuration

The client comes pre-configured with:

- **API Server**: `https://doot.foundation`
- **Mina L1**: `https://api.minascan.io/node/devnet/v1/graphql`
- **Zeko L2**: `https://devnet.zeko.io/graphql`

## Supported tokens

You can use any of these token names (case-sensitive, lowercase):

```javascript
const validTokens = [
  'mina',
  'ethereum',
  'solana',
  'bitcoin',
  'chainlink',
  'ripple',
  'dogecoin',
  'polygon',
  'avalanche',
  'cardano',
];
```

## Examples

### Simple price display

```javascript
import { Client } from '@doot-oracles/client';

const client = new Client('your-api-key');

async function showPrice() {
  try {
    const data = await client.getData('ethereum');
    console.log(`ETH: $${data.price_data.price}`);
    console.log(`Source: ${data.source}`);
  } catch (error) {
    console.log('Could not get price:', error.message);
  }
}

showPrice();
```

### Compare prices from different sources

```javascript
async function compareSources() {
  const client = new Client('your-api-key');

  try {
    // Get Bitcoin price from all sources
    const apiPrice = await client.getDataFromAPI('bitcoin');
    const l2Price = await client.getDataFromZekoL2('bitcoin');
    const l1Price = await client.getDataFromMinaL1('bitcoin');

    console.log('API price:', apiPrice.price_data.price);
    console.log('L2 price:', l2Price.price_data.price);
    console.log('L1 price:', l1Price.price_data.price);
  } catch (error) {
    console.log('Error:', error.message);
  }
}
```

### Build a price dashboard

```javascript
import { Client, validtokens } from '@doot-oracles/client';

const client = new Client('your-api-key');

async function showAllPrices() {
  console.log('Cryptocurrency Prices:');
  console.log('='.repeat(50));

  for (const token of validtokens) {
    try {
      const data = await client.getData(token);
      const price = parseFloat(data.price_data.price);
      const symbol = token.toUpperCase();

      console.log(
        `${symbol.padEnd(8)} $${price.toFixed(2).padStart(12)} (${data.source})`
      );
    } catch (error) {
      console.log(`${token.toUpperCase().padEnd(8)} Error: ${error.message}`);
    }
  }
}

showAllPrices();
```

## Need help?

- **Documentation**: Check our [full documentation](https://docs.doot.foundation)
- **API Key**: Get one at [doot.foundation](https://doot.foundation)
- **Issues**: Report bugs on [GitHub](https://github.com/Doot-Foundation/npm/issues)
- **Support**: Contact us at support@doot.foundation

## License

ISC License - see LICENSE.md for details.
