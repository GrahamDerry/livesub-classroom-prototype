// @ts-check

/**
 * Manages translation requests to LibreTranslate API with caching
 */
export class Translator {
    constructor() {
        this.cache = new Map();
        this.maxCacheSize = 200;
        this.apiEndpoint = 'https://libretranslate.de/translate';
        this.rateLimitDelay = 1000; // 1 second between requests
        this.lastRequestTime = 0;
    }

    /**
     * Translate text from English to Thai
     * @param {string} text - Text to translate
     * @returns {Promise<string>} Translated text
     */
    async translate(text) {
        const cleanText = text.trim().toLowerCase();
        if (!cleanText) {
            return '';
        }

        // Check cache first
        if (this.cache.has(cleanText)) {
            return this.cache.get(cleanText);
        }

        // Rate limiting
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.rateLimitDelay) {
            await this.delay(this.rateLimitDelay - timeSinceLastRequest);
        }

        try {
            const translation = await this.fetchTranslation(cleanText);
            
            // Cache the result
            this.cache.set(cleanText, translation);
            this.manageCacheSize();
            
            return translation;
        } catch (error) {
            console.error('Translation error:', error);
            return 'Translation unavailable';
        }
    }

    /**
     * Fetch translation from LibreTranslate API
     * @param {string} text - Text to translate
     * @returns {Promise<string>} Translated text
     */
    async fetchTranslation(text) {
        this.lastRequestTime = Date.now();

        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: 'en',
                target: 'th',
                format: 'text'
            })
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded');
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        return data.translatedText || 'Translation unavailable';
    }

    /**
     * Manage cache size by removing oldest entries
     */
    manageCacheSize() {
        if (this.cache.size > this.maxCacheSize) {
            const entriesToRemove = this.cache.size - this.maxCacheSize;
            const keys = Array.from(this.cache.keys()).slice(0, entriesToRemove);
            keys.forEach(key => this.cache.delete(key));
        }
    }

    /**
     * Clear the translation cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize
        };
    }

    /**
     * Utility function to delay execution
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Check if a word is already cached
     * @param {string} word - Word to check
     * @returns {boolean} True if cached
     */
    isCached(word) {
        return this.cache.has(word.trim().toLowerCase());
    }

    /**
     * Get cached translation if available
     * @param {string} word - Word to get translation for
     * @returns {string|undefined} Cached translation or undefined
     */
    getCachedTranslation(word) {
        return this.cache.get(word.trim().toLowerCase());
    }
} 