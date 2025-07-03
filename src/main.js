// @ts-check

import { TranscriptManager } from './transcript.js';
import { Translator } from './translator.js';
import { SidebarManager } from './sidebar.js';
import { PopoverManager } from './popover.js';
import { downloadFile } from './utils.js';

/**
 * Main application class that coordinates all components
 */
class LiveSubApp {
    constructor() {
        this.isRecording = false;
        this.isPaused = false;
        this.recognition = null;
        this.currentInterimText = '';
        
        // Initialize components
        this.transcript = new TranscriptManager();
        this.translator = new Translator();
        this.sidebar = new SidebarManager();
        this.popover = new PopoverManager(this.translator, this.sidebar);
        
        this.initializeSpeechRecognition();
        this.bindEvents();
        this.loadSavedWords();
    }

    /**
     * Initialize the Web Speech API recognition
     */
    initializeSpeechRecognition() {
        console.log('Initializing speech recognition...');
        console.log('webkitSpeechRecognition available:', 'webkitSpeechRecognition' in window);
        
        if (!('webkitSpeechRecognition' in window)) {
            console.error('Speech recognition not supported');
            alert('Speech recognition is not supported in this browser. Please use Chrome.');
            return;
        }

        try {
            // @ts-ignore - webkitSpeechRecognition is available in Chrome
            this.recognition = new webkitSpeechRecognition();
            console.log('Speech recognition object created:', this.recognition);
        } catch (error) {
            console.error('Error creating speech recognition object:', error);
            alert('Error creating speech recognition: ' + error.message);
            return;
        }
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            console.log('Speech recognition started');
            this.updateUI('recording');
        };

        this.recognition.onresult = (event) => {
            this.handleSpeechResult(event);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech' || event.error === 'audio-capture') {
                // Auto-restart on common errors
                setTimeout(() => {
                    if (this.isRecording) {
                        this.restartRecognition();
                    }
                }, 1000);
            }
        };

        this.recognition.onend = () => {
            console.log('Speech recognition ended');
            // Auto-restart if we're still supposed to be recording
            if (this.isRecording) {
                setTimeout(() => {
                    this.restartRecognition();
                }, 100);
            } else {
                this.updateUI('stopped');
            }
        };
    }

    /**
     * Handle speech recognition results
     */
    handleSpeechResult(event) {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        // Update live caption with interim results
        if (interimTranscript && !this.isPaused) {
            this.currentInterimText = interimTranscript;
            this.transcript.setLiveText(interimTranscript);
        }

        // Add final results to transcript
        if (finalTranscript) {
            this.currentInterimText = '';
            this.transcript.addLine(finalTranscript);
            this.transcript.setLiveText('');
        }
    }

    /**
     * Restart speech recognition after an error
     */
    restartRecognition() {
        try {
            this.recognition.stop();
        } catch (e) {
            // Ignore errors when stopping
        }
        
        setTimeout(() => {
            if (this.isRecording) {
                this.recognition.start();
            }
        }, 100);
    }

    /**
     * Start speech recognition
     */
    startRecording() {
        console.log('startRecording called');
        if (!this.recognition) {
            console.error('Speech recognition not available');
            alert('Speech recognition not available');
            return;
        }

        console.log('Starting speech recognition...');
        this.isRecording = true;
        try {
            this.recognition.start();
            console.log('Speech recognition start() called');
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            alert('Error starting speech recognition: ' + error.message);
        }
    }

    /**
     * Stop speech recognition
     */
    stopRecording() {
        this.isRecording = false;
        if (this.recognition) {
            this.recognition.stop();
        }
        this.currentInterimText = '';
        this.transcript.setLiveText('');
    }

    /**
     * Toggle pause state
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.transcript.setLiveText('PAUSED');
        } else {
            this.transcript.setLiveText(this.currentInterimText);
        }
        this.updateUI('paused');
    }

    /**
     * Clear all transcript content
     */
    clearTranscript() {
        this.transcript.clear();
        this.currentInterimText = '';
        this.transcript.setLiveText('');
    }

    /**
     * Download transcript as text file
     */
    downloadTranscript() {
        const lines = this.transcript.getLines();
        if (lines.length === 0) {
            alert('No transcript to download');
            return;
        }

        const content = lines.join('\n');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `livesub-transcript-${timestamp}.txt`;
        
        downloadFile(content, filename, 'text/plain');
    }

    /**
     * Load saved words from localStorage
     */
    loadSavedWords() {
        this.sidebar.loadSavedWords();
    }

    /**
     * Update UI based on current state
     */
    updateUI(state) {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const liveCaption = document.getElementById('liveCaption');

        if (!startBtn || !pauseBtn || !liveCaption) return;

        switch (state) {
            case 'recording':
                startBtn.textContent = 'Stop';
                startBtn.className = 'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors';
                if (pauseBtn instanceof HTMLButtonElement) {
                    pauseBtn.disabled = false;
                }
                break;
            case 'stopped':
                startBtn.textContent = 'Start';
                startBtn.className = 'bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors';
                if (pauseBtn instanceof HTMLButtonElement) {
                    pauseBtn.disabled = true;
                }
                liveCaption.textContent = 'Click "Start" to begin speech recognition...';
                break;
            case 'paused':
                if (pauseBtn instanceof HTMLButtonElement) {
                    pauseBtn.textContent = this.isPaused ? 'Resume Display' : 'Pause Display';
                }
                break;
        }
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Start/Stop button
        document.getElementById('startBtn').addEventListener('click', () => {
            console.log('Start button clicked, isRecording:', this.isRecording);
            if (this.isRecording) {
                this.stopRecording();
            } else {
                this.startRecording();
            }
        });

        // Pause button
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearTranscript();
        });

        // Download button
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadTranscript();
        });

        // Sidebar toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            this.sidebar.toggle();
        });

        document.getElementById('closeSidebar').addEventListener('click', () => {
            this.sidebar.close();
        });

        // Handle word clicks from transcript
        document.addEventListener('wordClick', (e) => {
            const { word, event } = e.detail;
            this.popover.show(word, event);
        });

        // Close popover when clicking outside
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (!target || !(target instanceof Node)) return;
            
            if (!this.popover?.contains(target) && !(target instanceof HTMLElement && target.classList.contains('word-clickable'))) {
                this.popover.hide();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        e.preventDefault();
                        if (this.isRecording) {
                            this.stopRecording();
                        } else {
                            this.startRecording();
                        }
                        break;
                    case 'p':
                        e.preventDefault();
                        this.togglePause();
                        break;
                    case 'c':
                        e.preventDefault();
                        this.clearTranscript();
                        break;
                    case 's':
                        e.preventDefault();
                        this.downloadTranscript();
                        break;
                }
            }
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('LiveSub Classroom initializing...');
    try {
        new LiveSubApp();
        console.log('LiveSub Classroom initialized successfully');
    } catch (error) {
        console.error('Failed to initialize LiveSub Classroom:', error);
        alert('Failed to initialize application: ' + error.message);
    }
}); 