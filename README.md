# Language Flashcard PWA 🧠

A fast, offline-first Progressive Web App for language learning. Create custom flashcard decks, import from CSV/JSON, generate decks with AI, and study with spaced repetition.

## ✨ Features

- **Create Custom Decks**: Add cards with front (Italian/Spanish/etc) and back (English/target language)
- **Import Decks**: Support for CSV, JSON, and TXT formats
- **AI Deck Generation**: Generate decks using OpenAI API (optional - demo mode available)
- **Offline Support**: All decks work offline with full PWA capability
- **Spaced Repetition**: Track learned cards and focus on difficult ones
- **Dark Mode**: Eye-friendly dark theme toggle
- **Progress Tracking**: Visual stats for cards learned, retention, and study streak
- **Data Export**: Backup and restore your data anytime
- **iPhone Optimized**: Add to home screen for native app experience

## 🚀 Quick Start

### Option 1: Deploy to GitHub Pages

1. **Fork or clone this repository**
   ```bash
   git clone https://github.com/yourusername/flashcard-app.git
   cd flashcard-app
   ```

2. **Add files to repository:**
   - `index.html` (main app)
   - `app.js` (application logic)
   - `manifest.json` (PWA metadata)
   - `README.md` (this file)

3. **Enable GitHub Pages:**
   - Go to Settings → Pages
   - Select "Deploy from a branch"
   - Choose `main` branch, `/root` directory
   - Click Save

4. **Access your app:**
   - Open: `https://yourusername.github.io/flashcard-app/`
   - On iPhone Safari: Tap Share → Add to Home Screen

### Option 2: Local Development

1. **Clone repository**
   ```bash
   git clone https://github.com/yourusername/flashcard-app.git
   ```

2. **Start local server** (Python 3)
   ```bash
   cd flashcard-app
   python -m http.server 8000
   ```

3. **Open browser**
   - Navigate to: `http://localhost:8000`

## 📚 How to Use

### Create a Deck
1. Tap **➕ Create Deck**
2. Enter deck name (e.g., "Italian A1")
3. Add cards one by one:
   - Front: Source language (Italian: "Ciao")
   - Back: Target language (English: "Hello")
4. Cards appear in preview below

### Import a Deck
1. Tap **📤 Import/Generate**
2. Choose file (CSV, JSON, or TXT)
3. File formats:
   ```
   CSV:
   front,back
   Ciao,Hello
   Grazie,Thank you

   JSON:
   {
     "decks": [{
       "name": "Italian",
       "cards": [{"front": "Ciao", "back": "Hello"}]
     }]
   }

   TXT (pairs, alternating):
   Ciao
   Hello
   Grazie
   Thank you
   ```

### Generate with AI
1. Tap **📤 Import/Generate**
2. Enter topic: "Italian food vocabulary" or "Spanish verbs"
3. (Optional) Enter OpenAI API key for better results
4. Tap **Generate Deck**
5. Preview appears - tap **Save Deck**

**Get free OpenAI API credits:** https://platform.openai.com/account/billing/overview

### Study Mode
1. Tap **📚 Study**
2. Select a deck from the list
3. Tap card to flip between front/back
4. Rate difficulty:
   - **Easy 👍**: Mark as learned (won't appear again)
   - **Hard 🔄**: See again in this session
   - **Skip ⏭️**: Next card without rating
5. Progress bar updates as you learn

## 💾 Data Management

### Export Data
- **Settings** → **💾 Export All Data**
- Downloads JSON backup with all decks + progress

### Import Data
- Use import function to restore from exported JSON file

### Clear Data
- **Settings** → **🗑️ Clear All Data** (caution: irreversible)

## 🌙 Dark Mode
- Tap **🌙** button in header to toggle
- Automatically uses device preference if not set
- Preference saved to device

## 📱 iPhone Setup

1. **Open in Safari**
   - `https://yourusername.github.io/flashcard-app/`

2. **Add to Home Screen**
   - Tap Share button (bottom)
   - Scroll → "Add to Home Screen"
   - Name: "Flashcards"
   - Tap Add

3. **Use like native app**
   - Opens fullscreen (no browser chrome)
   - Offline mode works
   - All data stays on device

## 🔧 Technical Details

### Architecture
- Single-page HTML app with embedded CSS and JavaScript
- No external dependencies (vanilla JS, no frameworks)
- Service Worker for offline caching
- localStorage for persistent data

### Browser Support
- Chrome 51+
- Firefox 55+
- Safari 11+ (iOS 11.3+)
- Edge 15+

### File Structure
```
├── index.html          (main app, all HTML/CSS/JS)
├── app.js             (application logic)
├── manifest.json      (PWA configuration)
└── README.md          (this file)
```

### Service Worker
- Automatically caches app files on first load
- Enables offline functionality
- Updates cache when app changes

## 🔐 Privacy & Security
- **All data stays on your device** - no server uploads
- No accounts required
- Encrypted localStorage (browser-level)
- OpenAI API key (if used) only sent directly to OpenAI

## 🐛 Troubleshooting

**App not saving data?**
- Check browser localStorage is enabled
- iOS: Settings → Safari → Privacy → Block All Cookies (disable if on)

**AI generation not working?**
- Invalid OpenAI API key → check format (sk-...)
- Quota exceeded → check billing at platform.openai.com
- Try demo mode (leave API key blank)

**Offline not working?**
- First visit must be online to cache files
- Service Worker requires HTTPS in production

**Slow on large decks?**
- Keep decks under 500 cards for best performance
- Split large sets into multiple decks

## 📊 Example Decks

### CSV Import Template
```csv
Front,Back
Ciao,Hello
Grazie,Thank you
Arrivederci,Goodbye
Quanto costa?,How much?
Mi piace,I like
```

### JSON Import Template
```json
{
  "decks": [{
    "name": "Italian Basics",
    "cards": [
      {"front": "Ciao", "back": "Hello"},
      {"front": "Grazie", "back": "Thank you"}
    ]
  }]
}
```

## 🎯 Study Tips

1. **Daily 15-minute sessions** beat cramming
2. **Space out reviews** - come back to hard cards later
3. **Mix with audio** - say words aloud while studying
4. **Export progress** - backup regularly
5. **Create themed decks** - organize by topic (verbs, food, travel)

## 🚀 Deployment Alternatives

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
Drag and drop folder to https://app.netlify.com

**Any static host:**
Upload all files to any web host (surge, Firebase Hosting, etc.)

## 📝 License
MIT License - use freely, modify, share

## 🤝 Contributing
Suggestions welcome! Open an issue or submit improvements.

## 💡 Future Features
- [ ] Spaced repetition algorithm improvements
- [ ] Study streaks and statistics
- [ ] Sound effects (correct/wrong)
- [ ] Sync across devices (optional cloud)
- [ ] Categories and sub-decks
- [ ] Pronunciation guide (text-to-speech)
- [ ] Anki deck import
- [ ] Collaborative deck sharing

## 📧 Support
Questions? Issues? Contact or open GitHub issue.

---

**Happy Learning! 🎓** Made for polyglot language learners everywhere.