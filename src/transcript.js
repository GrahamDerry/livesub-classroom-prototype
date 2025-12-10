// @ts-check

/**
 * Manages the transcript display and storage
 */
export class TranscriptManager {
    constructor() {
        this.lines = [];
        this.maxLines = 500;
        this.scrollBuffer = 40; // Buffer space in pixels below the last line
        this.transcriptContent = document.getElementById('transcriptContent');
        this.liveCaption = document.getElementById('liveCaption');
        this.lineCount = document.getElementById('lineCount');
        this.transcriptContainer = document.getElementById('transcriptContainer');
        
        // Validate required elements exist
        if (!this.transcriptContent) {
            throw new Error('transcriptContent element not found');
        }
        if (!this.liveCaption) {
            throw new Error('liveCaption element not found');
        }
        if (!this.lineCount) {
            throw new Error('lineCount element not found');
        }
        if (!this.transcriptContainer) {
            throw new Error('transcriptContainer element not found');
        }
        
        this.updateLineCount();
        
        // Add test button for debugging - wait for DOM to be ready
        setTimeout(() => this.addTestButton(), 100);
    }

    /**
     * Add a test button to simulate transcript lines for debugging
     */
    addTestButton() {
        console.log('Adding test button, hostname:', window.location.hostname);
        console.log('Port:', window.location.port);
        console.log('Protocol:', window.location.protocol);
        
        // Enhanced development environment detection
        const isDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.port === '3000' ||
                     window.location.protocol === 'file:' ||
                     window.location.hostname.includes('webcontainer') ||
                     window.location.hostname.includes('local-credentialless') ||
                     window.location.hostname.includes('stackblitz') ||
                     window.location.hostname.includes('bolt.new') ||
                     // Always show in development for testing
                     true; // Force enable for now
        
        console.log('Is development environment:', isDev);
        
        if (isDev) {
            // Find the header div that contains the line count
            const headerDiv = this.lineCount?.parentElement;
            if (headerDiv) {
                // Check if test buttons already exist
                if (headerDiv.querySelector('.test-buttons-container')) {
                    console.log('Test buttons already exist');
                    return;
                }
                
                // Create a container for the test button
                const testContainer = document.createElement('div');
                testContainer.className = 'test-buttons-container flex items-center space-x-2 mt-2';
                
                const testBtn = document.createElement('button');
                testBtn.textContent = 'Add Test Line';
                testBtn.className = 'bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs transition-colors';
                testBtn.onclick = () => this.addTestLine();
                
                const clearBtn = document.createElement('button');
                clearBtn.textContent = 'Clear Test';
                clearBtn.className = 'bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs transition-colors';
                clearBtn.onclick = () => this.clear();
                
                const scrollTestBtn = document.createElement('button');
                scrollTestBtn.textContent = 'Test Scroll';
                scrollTestBtn.className = 'bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-xs transition-colors';
                scrollTestBtn.onclick = () => this.testScrolling();
                
                testContainer.appendChild(testBtn);
                testContainer.appendChild(clearBtn);
                testContainer.appendChild(scrollTestBtn);
                headerDiv.appendChild(testContainer);
                
                console.log('Test buttons added successfully');
            } else {
                console.error('Could not find header div to add test button');
                console.log('lineCount element:', this.lineCount);
                console.log('lineCount parent:', this.lineCount?.parentElement);
            }
        }
    }

    /**
     * Test scrolling behavior by adding multiple lines quickly
     */
    testScrolling() {
        console.log('Testing scrolling behavior...');
        
        // Add 10 lines quickly to test auto-scroll
        for (let i = 1; i <= 10; i++) {
            setTimeout(() => {
                this.addTestLine();
                if (i === 10) {
                    console.log('Scroll test completed');
                    console.log('Final scroll info:', this.getScrollInfo());
                }
            }, i * 200); // 200ms delay between each line
        }
    }

    /**
     * Add a test line for debugging scrolling
     */
    addTestLine() {
        const testMessages = [
            "This is a test message to check scrolling behavior.",
            "The transcript should automatically scroll to show new content.",
            "Each new line should appear at the bottom of the transcript area.",
            "If you can see this message, the scrolling is working correctly.",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
            "Duis aute irure dolor in reprehenderit in voluptate velit esse.",
            "Excepteur sint occaecat cupidatat non proident, sunt in culpa.",
            "Qui officia deserunt mollit anim id est laborum et dolorum.",
            "The quick brown fox jumps over the lazy dog repeatedly.",
            "Testing auto-scroll functionality with this longer message.",
            "Another line to fill up the transcript area completely.",
            "Keep adding lines to test the scrolling behavior thoroughly.",
            "This should help us see if the auto-scroll is working properly."
        ];
        
        const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
        const timestamp = new Date().toLocaleTimeString();
        const lineNumber = this.lines.length + 1;
        this.addLine(`[Line ${lineNumber}] [${timestamp}] ${randomMessage}`);
        
        console.log('Test line added, total lines:', this.lines.length);
    }

    /**
     * Add a new line to the transcript
     * @param {string} text - The text to add
     */
    addLine(text) {
        // Clean up the text
        const cleanText = text.trim();
        if (!cleanText) return;

        console.log('Adding line to transcript:', cleanText);

        // Check if user was at bottom before adding new content
        const wasAtBottom = this.isAtBottom();
        console.log('User was at bottom:', wasAtBottom);

        // Add to lines array
        this.lines.push(cleanText);
        
        // Keep only the last maxLines
        if (this.lines.length > this.maxLines) {
            this.lines = this.lines.slice(-this.maxLines);
            // Remove excess DOM elements
            const children = this.transcriptContent.children;
            while (children.length > this.maxLines) {
                this.transcriptContent.removeChild(children[0]);
            }
        }

        // Create and add the DOM element
        this.createTranscriptLine(cleanText);
        
        // Update line count
        this.updateLineCount();
        
        // Only auto-scroll if user was at bottom (don't interrupt manual scrolling)
        if (wasAtBottom) {
            // Scroll to bottom with a small delay to ensure DOM is updated
            requestAnimationFrame(() => {
                this.scrollToBottom();
            });
        } else {
            console.log('Not auto-scrolling because user was not at bottom');
        }

        /* --- WebSocket broadcast --- */
        // Prevent duplicate messages with a simple debounce
        const now = Date.now();
        if (window.lastBroadcastTime && (now - window.lastBroadcastTime) < 100) {
            console.log("Skipping message too soon after last broadcast:", cleanText);
            return;
        }
        window.lastBroadcastTime = now;
        
        // @ts-ignore
        if (!window.captionSocket) {
            const wsUrl = `ws://${location.hostname}:3000`;
            console.log('Creating WebSocket connection to:', wsUrl);
            console.log('Current location:', location.href);
            // @ts-ignore
            window.captionSocket = new WebSocket(wsUrl);
            // @ts-ignore
            window.captionSocket.addEventListener('close', () => {
                console.warn('WS closed – captions will retry on next open');
            });
            // @ts-ignore
            window.captionSocket.addEventListener('open', () => {
                console.log('WebSocket connected successfully');
            });
            // @ts-ignore
            window.captionSocket.addEventListener('error', (error) => {
                console.error('WebSocket error:', error);
                console.error('WebSocket error details:', error.type, error.target?.readyState);
            });
        }

        // @ts-ignore
        if (window.captionSocket && window.captionSocket.readyState === 1) {
            const message = JSON.stringify({ type: 'caption', line: cleanText, ts: Date.now() });
            // @ts-ignore
            window.captionSocket.send(message);
            console.log("Broadcasting caption via WebSocket:", cleanText, "at", new Date().toISOString());
        } else {
            console.log("WebSocket not ready, readyState:", window.captionSocket?.readyState);
            // Try again after a short delay if still connecting
            if (window.captionSocket?.readyState === 0) {
                setTimeout(() => {
                    // @ts-ignore
                    if (window.captionSocket && window.captionSocket.readyState === 1) {
                        // @ts-ignore
                        window.captionSocket.send(
                            JSON.stringify({ type: 'caption', line: cleanText, ts: Date.now() })
                        );
                        console.log("Broadcasting caption via WebSocket (delayed):", cleanText);
                    }
                }, 100);
            }
        }
    }

    /**
     * Create a transcript line element with clickable words
     * @param {string} text - The text for the line
     */
    createTranscriptLine(text) {
        const lineElement = document.createElement('div');
        lineElement.className = 'transcript-line p-3 rounded border-b border-gray-100 hover:bg-gray-50 transition-colors';
        
        // Split text into words and make each clickable
        const words = text.split(/\s+/);
        const wordElements = words.map(word => {
            const wordElement = document.createElement('span');
            wordElement.className = 'word-clickable inline-block mr-1';
            wordElement.textContent = word;
            wordElement.dataset.word = word.toLowerCase().replace(/[^\w]/g, '');
            
            // Add click event for translation
            wordElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleWordClick(word, e);
            });
            
            return wordElement;
        });
        
        lineElement.append(...wordElements);
        this.transcriptContent.appendChild(lineElement);
        
        console.log('Line element added to DOM, total DOM children:', this.transcriptContent.children.length);
    }

    /**
     * Handle word click for translation
     * @param {string} word - The clicked word
     * @param {Event} event - The click event
     */
    handleWordClick(word, event) {
        // Dispatch a custom event that main.js can listen to
        const customEvent = new CustomEvent('wordClick', {
            detail: { word, event }
        });
        document.dispatchEvent(customEvent);
    }

    /**
     * Set the live caption text (for interim results)
     * @param {string} text - The text to display
     */
    setLiveText(text) {
        if (this.liveCaption) {
            this.liveCaption.textContent = text || '';
        }
    }

    /**
     * Clear all transcript content
     */
    clear() {
        this.lines = [];
        this.transcriptContent.innerHTML = '';
        this.updateLineCount();
        console.log('Transcript cleared');
    }

    /**
     * Get all transcript lines
     * @returns {string[]} Array of transcript lines
     */
    getLines() {
        return [...this.lines];
    }

    /**
     * Update the line count display
     */
    updateLineCount() {
        if (this.lineCount) {
            this.lineCount.textContent = `${this.lines.length} lines`;
        }
    }

    /**
     * Scroll transcript to the bottom with buffer space
     */
    scrollToBottom() {
        if (!this.transcriptContainer) {
            console.error('transcriptContainer not found for scrolling');
            return;
        }

        const scrollHeight = this.transcriptContainer.scrollHeight;
        const clientHeight = this.transcriptContainer.clientHeight;
        
        // Calculate scroll position with buffer - scroll to leave buffer space below last line
        const maxScrollTop = scrollHeight - clientHeight;
        const targetScrollTop = Math.max(0, maxScrollTop - this.scrollBuffer);

        console.log('Scrolling to bottom with buffer:', {
            scrollHeight,
            clientHeight,
            maxScrollTop,
            buffer: this.scrollBuffer,
            targetScrollTop,
            currentScrollTop: this.transcriptContainer.scrollTop
        });

        // Use scrollTop directly for immediate scrolling
        this.transcriptContainer.scrollTop = targetScrollTop;
        
        // Also try smooth scroll as backup
        this.transcriptContainer.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
        });
    }

    /**
     * Get the current number of lines
     * @returns {number} Number of lines
     */
    getLineCount() {
        return this.lines.length;
    }

    /**
     * Check if user is at the bottom of the transcript (considering buffer)
     * @returns {boolean} True if at bottom
     */
    isAtBottom() {
        if (!this.transcriptContainer) return true;
        
        const { scrollTop, scrollHeight, clientHeight } = this.transcriptContainer;
        // Consider user "at bottom" if they're within buffer + threshold of the actual bottom
        const threshold = this.scrollBuffer + 50; // Buffer plus additional threshold
        
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;
        
        console.log('Checking if at bottom:', {
            scrollTop,
            clientHeight,
            scrollHeight,
            buffer: this.scrollBuffer,
            threshold,
            isAtBottom
        });
        
        return isAtBottom;
    }

    /**
     * Get scroll position info for debugging
     * @returns {Object} Scroll position information
     */
    getScrollInfo() {
        if (!this.transcriptContainer) return {};
        
        return {
            scrollTop: this.transcriptContainer.scrollTop,
            scrollHeight: this.transcriptContainer.scrollHeight,
            clientHeight: this.transcriptContainer.clientHeight,
            buffer: this.scrollBuffer,
            isAtBottom: this.isAtBottom()
        };
    }

    /**
     * Set the scroll buffer size
     * @param {number} bufferPixels - Buffer size in pixels
     */
    setScrollBuffer(bufferPixels) {
        this.scrollBuffer = Math.max(0, bufferPixels);
        console.log('Scroll buffer set to:', this.scrollBuffer, 'pixels');
    }

    /**
     * Get the current scroll buffer size
     * @returns {number} Buffer size in pixels
     */
    getScrollBuffer() {
        return this.scrollBuffer;
    }
}