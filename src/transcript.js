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
        
        this.updateLineCount();
    }

    /**
     * Add a new line to the transcript
     * @param {string} text - The text to add
     */
    addLine(text) {
        // Clean up the text
        const cleanText = text.trim();
        if (!cleanText) return;

        // Add to lines array
        this.lines.push(cleanText);
        
        // Keep only the last maxLines
        if (this.lines.length > this.maxLines) {
            this.lines = this.lines.slice(-this.maxLines);
        }

        // Create and add the DOM element
        this.createTranscriptLine(cleanText);
        
        // Update line count
        this.updateLineCount();
        
        // Scroll to bottom
        this.scrollToBottom();
    }

    /**
     * Create a transcript line element with clickable words
     * @param {string} text - The text for the line
     */
    createTranscriptLine(text) {
        const lineElement = document.createElement('div');
        lineElement.className = 'transcript-line p-2 rounded';
        
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
        const container = document.getElementById('transcriptContainer');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    /**
     * Get the current number of lines
     * @returns {number} Number of lines
     */
    getLineCount() {
        return this.lines.length;
    }
} 