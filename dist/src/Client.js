import axios from "axios";
import { Mina, PublicKey, fetchAccount } from "o1js";
import { Doot, offchainState } from "./constants/Doot.js";
const validtokens = [
    "mina",
    "ethereum",
    "solana",
    "bitcoin",
    "chainlink",
    "ripple",
    "dogecoin",
    "polygon",
    "avalanche",
    "cardano",
];
// Token index mapping for price array
const tokenIndexMap = {
    "mina": 0,
    "bitcoin": 1,
    "ethereum": 2,
    "solana": 3,
    "ripple": 4,
    "cardano": 5,
    "avalanche": 6,
    "polygon": 7,
    "chainlink": 8,
    "dogecoin": 9,
};
class Client {
    constructor(key) {
        // Compilation state tracking
        this.compilationState = {
            isCompiled: false,
            compiledAt: 0
        };
        // Price cache (2-3 minutes)
        this.priceCache = new Map();
        this.CACHE_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds
        // Network instances cache
        this.l1Network = null;
        this.l2Network = null;
        this.Key = key;
        this.BaseURL = "https://doot.foundation";
        this.MinaL1Endpoint = "https://api.minascan.io/node/devnet/v1/graphql";
        this.ZekoL2Endpoint = "https://devnet.zeko.io/graphql";
        // Both L1 and L2 use the same contract address
        this.DootL1Address = PublicKey.fromBase58("B62qrbDCjDYEypocUpG3m6eL62zcvexsaRjhSJp5JWUQeny1qVEKbyP");
        this.DootL2Address = PublicKey.fromBase58("B62qrbDCjDYEypocUpG3m6eL62zcvexsaRjhSJp5JWUQeny1qVEKbyP");
    }
    /**
     * Compile contracts once and cache the result
     */
    async ensureCompiled() {
        if (this.compilationState.isCompiled) {
            console.log('Using cached compilation...');
            return;
        }
        console.log('Compiling offchain state and Doot contract (one-time)...');
        if (offchainState && typeof offchainState.compile === 'function') {
            try {
                await offchainState.compile();
            }
            catch (error) {
                console.error('offchainState compilation failed with:', error);
                throw new Error(`OffchainState compilation failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        await Doot.compile();
        this.compilationState.isCompiled = true;
        this.compilationState.compiledAt = Date.now();
        console.log('Compilation completed and cached');
    }
    /**
     * Get cached price data if available and fresh
     */
    getCachedPrice(token, source) {
        const cacheKey = `${token}-${source}`;
        const cached = this.priceCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
            console.log(`Using cached ${source} price for ${token} (${Math.round((Date.now() - cached.timestamp) / 1000)}s old)`);
            return cached.data;
        }
        return null;
    }
    /**
     * Cache price data
     */
    setCachedPrice(token, source, data) {
        const cacheKey = `${token}-${source}`;
        this.priceCache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            source
        });
    }
    /**
     * Setup network connection and cache it
     */
    setupNetwork(endpoint, isL2) {
        if (isL2 && this.l2Network) {
            return this.l2Network;
        }
        if (!isL2 && this.l1Network) {
            return this.l1Network;
        }
        const network = Mina.Network({
            mina: endpoint,
            archive: endpoint,
        });
        if (isL2) {
            this.l2Network = network;
        }
        else {
            this.l1Network = network;
        }
        return network;
    }
    /**
     * Check if API key is valid
     */
    async isKeyValid() {
        try {
            const response = await axios.get(`${this.BaseURL}/api/get/user/getKeyStatus`, {
                headers: {
                    Authorization: `Bearer ${this.Key}`,
                },
            });
            return response.data.status;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Smart fallback system: API → L2 → L1
     * Gets price data with automatic fallback through all available sources
     */
    async getData(token) {
        if (validtokens.indexOf(token) === -1) {
            throw new Error(`Invalid token! Supported: ${validtokens.join(', ')}`);
        }
        let apiError = null;
        let l2Error = null;
        let l1Error = null;
        // Try API first
        try {
            console.log('Trying API...');
            return await this.getFromAPI(token);
        }
        catch (error) {
            apiError = error;
            console.log(`API failed: ${error}`);
        }
        // Try L2 if API fails
        try {
            console.log('Trying L2...');
            return await this.getFromL2(token);
        }
        catch (error) {
            l2Error = error;
            console.log(`L2 failed: ${error}`);
        }
        // Try L1 if L2 fails
        try {
            console.log('Trying L1...');
            return await this.getFromL1(token);
        }
        catch (error) {
            l1Error = error;
            console.log(`L1 failed: ${error}`);
        }
        // All sources failed
        throw new Error(`All sources failed - API: ${apiError}, L2: ${l2Error}, L1: ${l1Error}`);
    }
    /**
     * Get signed price data directly from Doot API (fastest method)
     * Requires valid API key
     */
    async getFromAPI(token) {
        if (validtokens.indexOf(token) === -1) {
            throw new Error(`Invalid token! Supported: ${validtokens.join(', ')}`);
        }
        try {
            const response = await axios.get(`${this.BaseURL}/api/get/price`, {
                params: { token },
                headers: {
                    Authorization: `Bearer ${this.Key}`,
                },
            });
            if (!response?.data?.data) {
                throw new Error('No data received from API');
            }
            const data = response.data.data;
            const price = data.price_data.price;
            const decimals = String(data.price_data.decimals);
            const aggregationTimestamp = String(data.price_data.aggregationTimestamp);
            const signature = data.price_data.signature.signature;
            const oracle = data.price_data.signature.publicKey;
            const proof_data = JSON.stringify(data.proof_data);
            return {
                fromAPI: true,
                fromL2: false,
                fromL1: false,
                source: 'API',
                price_data: {
                    token: token,
                    price: price,
                    decimals: decimals,
                    aggregationTimestamp: aggregationTimestamp,
                    signature: signature,
                    oracle: oracle,
                },
                proof_data: JSON.stringify(proof_data),
            };
        }
        catch (error) {
            throw new Error(`API request failed: ${error.message}`);
        }
    }
    /**
     * Get price data directly from Zeko L2 blockchain (fast, ~5-30s)
     * Reads from deployed smart contract on Zeko L2
     */
    async getFromL2(token) {
        if (validtokens.indexOf(token) === -1) {
            throw new Error(`Invalid token! Supported: ${validtokens.join(', ')}`);
        }
        // Check cache first
        const cached = this.getCachedPrice(token, 'L2');
        if (cached) {
            return cached;
        }
        try {
            const operation = async () => {
                console.log(`Connecting to Zeko L2: ${this.ZekoL2Endpoint}`);
                // Setup Zeko L2 network using cached connection
                const ZekoL2 = this.setupNetwork(this.ZekoL2Endpoint, true);
                Mina.setActiveInstance(ZekoL2);
                console.log(`Fetching account: ${this.DootL2Address.toBase58()}`);
                const accountResult = await fetchAccount({ publicKey: this.DootL2Address });
                if (accountResult.error) {
                    throw new Error(`Failed to fetch account: ${accountResult.error.statusText}`);
                }
                // Use shared compilation
                await this.ensureCompiled();
                console.log('Getting prices from contract...');
                const dootZkApp = new Doot(this.DootL2Address);
                dootZkApp.offchainState.setContractInstance(dootZkApp);
                let allPrices;
                try {
                    allPrices = await dootZkApp.getPrices();
                }
                catch (priceError) {
                    // Check if error is root mismatch (Field.assertEquals failure)
                    if (priceError.message && priceError.message.includes('Field.assertEquals')) {
                        throw new Error('OffchainState still settling, please wait for a while before calling again');
                    }
                    throw priceError;
                }
                // Extract specific token price
                const tokenIndex = tokenIndexMap[token];
                if (tokenIndex === undefined) {
                    throw new Error(`Token index not found for: ${token}`);
                }
                const tokenPrice = allPrices.prices[tokenIndex];
                console.log(`Retrieved ${token} price from L2: ${tokenPrice.toString()}`);
                const result = {
                    fromAPI: false,
                    fromL2: true,
                    fromL1: false,
                    source: 'L2',
                    price_data: {
                        token: token,
                        price: tokenPrice.toString(),
                        decimals: "10",
                        aggregationTimestamp: Date.now().toString(),
                        signature: "",
                        oracle: this.DootL2Address.toBase58(),
                    },
                    proof_data: "",
                };
                // Cache the result
                this.setCachedPrice(token, 'L2', result);
                return result;
            };
            return await operation();
        }
        catch (error) {
            throw new Error(`Zeko L2 request failed: ${error.message}`);
        }
    }
    /**
     * Get price data directly from Mina L1 blockchain (secure, ~30-60s)
     * Reads from deployed smart contract on Mina L1
     */
    async getFromL1(token) {
        if (validtokens.indexOf(token) === -1) {
            throw new Error(`Invalid token! Supported: ${validtokens.join(', ')}`);
        }
        // Check cache first
        const cached = this.getCachedPrice(token, 'L1');
        if (cached) {
            return cached;
        }
        try {
            const operation = async () => {
                console.log(`Connecting to Mina L1: ${this.MinaL1Endpoint}`);
                // Setup Mina L1 network using cached connection
                const MinaL1 = this.setupNetwork(this.MinaL1Endpoint, false);
                Mina.setActiveInstance(MinaL1);
                console.log(`Fetching account: ${this.DootL1Address.toBase58()}`);
                const accountResult = await fetchAccount({ publicKey: this.DootL1Address });
                if (accountResult.error) {
                    throw new Error(`Failed to fetch account: ${accountResult.error.statusText}`);
                }
                // Use shared compilation
                await this.ensureCompiled();
                console.log('Getting prices from contract...');
                const dootZkApp = new Doot(this.DootL1Address);
                dootZkApp.offchainState.setContractInstance(dootZkApp);
                let allPrices;
                try {
                    allPrices = await dootZkApp.getPrices();
                }
                catch (priceError) {
                    // Check if error is root mismatch (Field.assertEquals failure)
                    if (priceError.message && priceError.message.includes('Field.assertEquals')) {
                        throw new Error('OffchainState still settling, please wait for a while before calling again');
                    }
                    throw priceError;
                }
                // Extract specific token price
                const tokenIndex = tokenIndexMap[token];
                if (tokenIndex === undefined) {
                    throw new Error(`Token index not found for: ${token}`);
                }
                const tokenPrice = allPrices.prices[tokenIndex];
                console.log(`Retrieved ${token} price from L1: ${tokenPrice.toString()}`);
                const result = {
                    fromAPI: false,
                    fromL2: false,
                    fromL1: true,
                    source: 'L1',
                    price_data: {
                        token: token,
                        price: tokenPrice.toString(),
                        decimals: "10",
                        aggregationTimestamp: Date.now().toString(),
                        signature: "",
                        oracle: this.DootL1Address.toBase58(),
                    },
                    proof_data: "",
                };
                // Cache the result
                this.setCachedPrice(token, 'L1', result);
                return result;
            };
            return await operation();
        }
        catch (error) {
            throw new Error(`Mina L1 request failed: ${error.message}`);
        }
    }
}
export { Client, validtokens };
