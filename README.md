# LiveSub Classroom - Weekend Prototype

A single-page web application for EFL (English as a Foreign Language) teaching that provides real-time speech-to-text captions with Thai translations. Perfect for classroom use with projector or screen sharing.

## Features

### 🎤 Real-time Speech Recognition
- Uses Chrome's Web Speech API for continuous speech-to-text
- Large, prominent live captions for classroom visibility
- Automatic reconnection on network glitches
- Pause/resume functionality for better control

### 📝 Interactive Transcript
- Scrollable transcript with newest content at bottom
- Click any word to get instant Thai translation
- Automatic line management (keeps last 500 lines)
- Export transcript as downloadable text file

### 🌐 Translation Features
- LibreTranslate integration for English→Thai translations
- Smart caching (200 entries) to reduce API calls
- Rate limiting to respect API limits
- Graceful error handling for network issues

### 💾 Vocabulary Management
- Save words and translations to "My Words" sidebar
- Persistent storage using localStorage
- Easy word removal and management
- Clean, organized interface

### 🎨 Modern UI
- Responsive design with Tailwind CSS
- Clean, professional interface
- Keyboard shortcuts for power users
- Smooth animations and transitions

## Quick Start

### Option 1: Development Server (Recommended)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open automatically at `http://localhost:3000`

### Option 2: Direct File Access
Simply open `public/index.html` in Chrome (v115+)

## Browser Requirements

- **Chrome v115+** (required for Web Speech API)
- Microphone permissions
- Internet connection (for translations)

## Usage

### Basic Operation
1. **Start**: Click "Start" button to begin speech recognition
2. **Speak**: Your speech appears as live captions and in the transcript
3. **Pause**: Use "Pause Display" to freeze captions temporarily
4. **Clear**: "Clear Screen" removes all transcript content
5. **Download**: Export transcript as a text file

### Translation Features
1. **Click Words**: Click any word in the transcript
2. **View Translation**: Thai translation appears in a popover
3. **Save Words**: Click "Save Word" to add to your vocabulary list
4. **Access Vocabulary**: Use the purple sidebar button to view saved words

### Keyboard Shortcuts
- `Ctrl/Cmd + Enter`: Start/Stop recording
- `Ctrl/Cmd + P`: Pause/Resume display
- `Ctrl/Cmd + C`: Clear screen
- `Ctrl/Cmd + S`: Download transcript
- `Escape`: Close translation popover

## Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript with ES modules
- **Build Tool**: Vite for fast development
- **Styling**: Tailwind CSS (CDN)
- **Speech Recognition**: Web Speech API (webkitSpeechRecognition)
- **Translation**: LibreTranslate public API
- **Storage**: localStorage for vocabulary persistence

### File Structure
```
├── public/
│   └── index.html          # Main HTML file
├── src/
│   ├── main.js            # Application entry point
│   ├── transcript.js      # Transcript management
│   ├── translator.js      # Translation API integration
│   ├── sidebar.js         # Vocabulary sidebar
│   ├── popover.js         # Translation popover
│   └── utils.js           # Utility functions
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
└── tsconfig.json          # TypeScript configuration
```

### API Integration
- **LibreTranslate**: `https://libretranslate.de/translate`
- **Rate Limiting**: 1 second between requests
- **Caching**: In-memory LRU cache (200 entries)
- **Error Handling**: Graceful fallbacks for network issues

## Known Limitations

### Current Prototype
- **Browser Support**: Chrome only (Web Speech API limitation)
- **Network Dependency**: Requires internet for translations
- **Single Device**: No multi-device synchronization
- **Audio Quality**: Depends on microphone quality
- **Translation Accuracy**: Uses free LibreTranslate service

### Technical Constraints
- **Speech Recognition**: Limited to English language
- **Translation**: English→Thai only
- **Storage**: Limited to browser localStorage
- **Performance**: Large transcripts may impact memory usage

## Next Steps

### Pilot Phase (Multi-device)
- **WebSocket Integration**: Real-time broadcast to student devices
- **Student Interface**: Dedicated view for student screens
- **Device Synchronization**: Coordinated captions across devices
- **Network Resilience**: Offline mode and reconnection logic

### Beta Phase (Production Ready)
- **Google Cloud Speech**: Replace Web Speech API for better accuracy
- **Authentication**: User accounts and session management
- **Firestore Integration**: Cloud-based vocabulary storage
- **Analytics**: Usage tracking and performance metrics
- **Multi-language**: Support for additional languages

### OSS Launch
- **Docker Deployment**: Containerized application
- **Documentation**: Comprehensive setup and usage guides
- **Educator Tools**: Classroom setup scripts and templates
- **Community Features**: Shared vocabulary lists and resources
- **Mobile Support**: Progressive Web App capabilities

## Development

### Adding TypeScript
The project is configured for TypeScript migration:
1. Rename `.js` files to `.ts`
2. Add type annotations
3. Run `npm run build` to compile

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly in Chrome
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check browser compatibility
- Ensure microphone permissions are granted
- Verify internet connection for translations
- Review console for error messages

---

**Built for EFL educators** - Making language learning more accessible and interactive! 🎓 