// @ts-check

/**
 * Manages the transcript display and storage
 */
export class TranscriptManager {
    constructor() {
        this.lines = [];
        this.maxLines = 500;
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
        
        // Add test button for debugging
        this.addTestButton();
    }

    /**
     * Add a test button to simulate transcript lines for debugging
     */
    addTestButton() {
        // Only add in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const testBtn = document.createElement('button');
            testBtn.textContent = 'Add Test Line';
            testBtn.className = 'bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm ml-2';
            testBtn.onclick = () => this.addTestLine();
            
            const lineCountElement = document.getElementById('lineCount');
            if (lineCountElement && lineCountElement.parentNode) {
                lineCountElement.parentNode.appendChild(testBtn);
            }
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
            "Qui officia deserunt mollit anim id est laborum et dolorum."
        ];
        
        const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
        const timestamp = new Date().toLocaleTimeString();
        this.addLine(`[${timestamp}] ${randomMessage}`);
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
        
        // Scroll to bottom with a small delay to ensure DOM is updated
        requestAnimationFrame(() => {
            this.scrollToBottom();
        });
    }

    /**
     * Create a transcript line element with clickable words
     * @param {string} text - The text for the line
     */
    createTranscriptLine(text) {
        const lineElement = document.createElement('div');
        lineElement.className = 'transcript-line p-2 rounded border-b border-gray-100';
        
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
        
        console.log('Line element added to DOM, total lines:', this.transcriptContent.children.length);
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
     * Scroll transcript to the bottom
     */
    scrollToBottom() {
        if (!this.transcriptContainer) {
            console.error('transcriptContainer not found for scrolling');
            return;
        }

        const scrollHeight = this.transcriptContainer.scrollHeight;
        const clientHeight = this.transcriptContainer.clientHeight;
        const scrollTop = scrollHeight - clientHeight;

        console.log('Scrolling to bottom:', {
            scrollHeight,
            clientHeight,
            scrollTop,
            currentScrollTop: this.transcriptContainer.scrollTop
        });

        // Smooth scroll to bottom
        this.transcriptContainer.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
        });

        // Fallback for browsers that don't support smooth scrolling
        setTimeout(() => {
            this.transcriptContainer.scrollTop = scrollTop;
        }, 100);
    }

    /**
     * Get the current number of lines
     * @returns {number} Number of lines
     */
    getLineCount() {
        return this.lines.length;
    }

    /**
     * Check if user is at the bottom of the transcript
     * @returns {boolean} True if at bottom
     */
    isAtBottom() {
        if (!this.transcriptContainer) return true;
        
        const { scrollTop, scrollHeight, clientHeight } = this.transcriptContainer;
        const threshold = 50; // pixels from bottom
        
        return scrollTop + clientHeight >= scrollHeight - threshold;
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
            isAtBottom: this.isAtBottom()
        };
    }
}