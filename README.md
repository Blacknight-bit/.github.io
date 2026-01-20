# 🧠 Language Flashcards PWA - Complete Documentation

## ✨ New Features Added

### 1. **Separated Deck Creation & Modification**
- **Create Deck**: New dedicated view for creating empty decks with just a name
- **Edit Deck**: Separate view for adding/removing cards from existing decks
- Clear workflow: Create → Edit → Study

### 2. **Deck View Button**
- Each deck shows action buttons: View (👁️), Stats (📊), Study (📚), Reset (🔄), Delete (🗑️)
- Quick access to all deck operations from the home screen
- Visual card count and learning progress on each deck

### 3. **Stats Preview & Forgetting Curve**
- **Session Results**: Shows detailed stats after completing a study session
  - Easy cards 👍
  - Hard cards 🔄
  - Skipped cards ⏭️
  - Total cards learned

- **Ebbinghaus Forgetting Curve**: Based on scientific research
  - Day 1: 90% retention
  - Day 3: 72% retention
  - Day 7: 54% retention
  - Day 14: 35% retention
  - Day 30: 21% retention
  
- **Deck Statistics**: Dedicated stats page showing:
  - Total cards in deck
  - Cards learned
  - Retention percentage
  - Total reviews conducted
  - Forgetting curve projection

### 4. **Reset/Forget Deck Feature**
- Reset button (🔄) on each deck
- Completely resets all progress to zero
- All cards return to "new" status
- Perfect for re-learning or starting fresh
- Confirmation dialog to prevent accidents

### 5. **Complete File Structure**

```
flashcards-app/
├── index.html          (Main app - all views)
├── app.js             (Application logic - 400+ lines)
├── styles.css         (Complete styling)
├── sw.js              (Service Worker - offline support)
├── manifest.json      (PWA configuration)
└── README.md          (This file)
```

## 🚀 Quick Start

### Option 1: Deploy to GitHub Pages

```bash
# Clone or create repository
git clone https://github.com/yourusername/flashcards.git
cd flashcards

# Create all files (already included in this package)
# Commit and push to GitHub

# Enable GitHub Pages:
# Settings → Pages → Deploy from branch → main → /root → Save

# Access at: https://yourusername.github.io/flashcards/
```

### Option 2: Local Development

```bash
# Python 3
cd flashcards
python -m http.server 8000

# Open: http://localhost:8000
```

### Option 3: Vercel / Netlify

```bash
# Vercel
vercel

# Netlify
Drag and drop folder to https://app.netlify.com
```

## 📱 iPhone Setup

1. Open in Safari: `https://yourusername.github.io/flashcards/`
2. Tap Share → Add to Home Screen
3. Use like a native app!

## 🎮 How to Use

### Create a Deck
1. Tap **➕ Create Deck**
2. Enter deck name (e.g., "Italian Basics")
3. You're sent to the Edit view
4. Add cards one by one:
   - Front: Italian word
   - Back: English translation
5. Tap **Add Card** after each card

### View & Manage Decks
From home screen, each deck shows:
- **👁️ View**: Opens edit view to manage cards
- **📊 Stats**: See detailed statistics and forgetting curve
- **📚 Study**: Start a study session
- **🔄 Reset**: Forget all progress and start over
- **🗑️ Delete**: Remove the entire deck

### Study a Deck
1. Tap the **📚 Study** button on a deck
2. Tap the card to flip between front/back
3. Rate difficulty:
   - **Easy 👍**: Card marked as learned (won't appear again)
   - **Hard 🔄**: See again in this session
   - **Skip ⏭️**: Next card without rating
4. Complete the session to see results

### Session Results
After finishing:
- See cards learned, hard cards, skipped
- View Ebbinghaus forgetting curve
- Plan next review dates based on science
- Confetti 🎉 celebrates your learning!

### Reset Progress
1. From home screen, tap **🔄** (Reset) on a deck
2. Confirm - all progress erased
3. All cards become "new" again
4. Perfect for re-learning or practicing

### View Statistics
1. Tap **📊 Stats** on any deck
2. See:
   - Total cards
   - Cards learned
   - Retention percentage
   - Total reviews
   - Forgetting curve projection

## 📊 Statistics & Spaced Repetition

### What Gets Tracked
- **Cards Learned**: Marked as "Easy" - won't appear again
- **Hard Cards**: Flagged for extra review
- **Total Reviews**: Cumulative study sessions
- **Retention %**: (Cards Learned / Total Cards) × 100

### Ebbinghaus Forgetting Curve
Science shows optimal review timing:
- **Day 1**: Review immediately after learning (90% retention)
- **Day 3**: Review 3 days later (72% retention)
- **Day 7**: Review 1 week later (54% retention)
- **Day 14**: Review 2 weeks later (35% retention)
- **Day 30**: Review 1 month later (21% retention)

*Plan your reviews based on these scientifically-proven intervals for maximum retention!*

## 💾 Data Management

### Export Data
- **Settings** → **💾 Export All Data**
- Downloads JSON backup with all decks and progress
- Keep as backup!

### Import Data
- Use import function to restore from exported JSON
- Perfect for switching devices

### Clear Data
- **Settings** → **🗑️ Clear All Data**
- ⚠️ Irreversible! Backs up first.

## 🌙 Dark Mode
- Tap **🌙** button in header
- Automatically uses device preference
- Preference saves to device

## 🔧 File Descriptions

### `index.html` (9KB)
- Main app structure
- All 9 views:
  - Home (deck list)
  - Create Deck
  - Edit Deck (manage cards)
  - Study Mode
  - Session Results
  - Deck Stats
  - Import/Generate
  - Settings
  - Navigation sidebar
- Responsive design
- Accessible markup

### `app.js` (400+ lines)
Core logic:
- **FlashcardApp class** - Main application
- **View Management** - Switch between pages
- **Deck Operations**:
  - Create, edit, delete decks
  - Add/remove cards
  - Reset/forget decks
- **Study Mode**:
  - Display cards
  - Track responses
  - Calculate statistics
- **Stats & Analytics**:
  - Session results
  - Forgetting curve
  - Retention tracking
- **Data Persistence**:
  - localStorage for offline
  - Import/export JSON
- **Dark Mode** toggle
- **Confetti animation**

### `styles.css` (400+ lines)
Complete styling:
- **Layout**:
  - Card flip animation
  - Responsive grid
  - Mobile-first design
  - Safe area insets (notches)
- **Components**:
  - Buttons and forms
  - Progress bars
  - Statistics cards
  - Deck items
  - Modal overlay
  - Sidebar navigation
- **Theming**:
  - Light mode (default)
  - Dark mode
  - Smooth transitions
  - Glassmorphism header

### `sw.js` (30 lines)
Service Worker:
- **Offline Support**: Cache app on first load
- **Cache Strategy**: Network-first, fallback to cache
- **Auto Updates**: Cache busting on deploy

### `manifest.json` (40 lines)
PWA Configuration:
- App metadata
- Icons (SVG)
- Shortcuts
- Installation settings
- Theme colors

## 🔐 Privacy & Security

- ✅ **All data stays on your device** - No server uploads
- ✅ **No accounts needed** - Use immediately
- ✅ **Offline-first** - Works without internet
- ✅ **Encrypted storage** - Browser-level encryption
- ✅ **No tracking** - No analytics, no ads

## 🐛 Troubleshooting

**App not saving data?**
- Check browser allows localStorage
- iOS: Settings → Safari → Cookies (enable)
- Try different browser if needed

**Dark mode not saving?**
- Browser must allow localStorage
- Try clearing cache and reloading

**Cards not appearing?**
- Make sure you added cards in Edit Deck view
- Check deck has cards (> 0)

**Study mode slow?**
- Too many cards? Split into multiple decks
- Mobile browser may need refresh

**Offline not working?**
- First visit must be online to cache
- Safari iOS: Website needs HTTPS
- Wait 10 seconds for Service Worker to install

## 📚 Example Usage Flow

```
1. Create Deck
   Name: "Spanish Food Vocab"
   ↓
2. Edit Deck
   Add cards:
   - Pan / Bread
   - Agua / Water
   - Leche / Milk
   ↓
3. Study Session
   Review cards
   Mark as Easy/Hard/Skip
   ↓
4. Session Results
   See stats and forgetting curve
   ↓
5. Plan Reviews
   Based on Ebbinghaus curve:
   - Review Day 1, 3, 7, 14, 30
   ↓
6. Reset if Needed
   Start over and re-learn
```

## 🎯 Study Tips

1. **Daily 15-minute sessions** beat cramming
2. **Space out reviews** - Follow Ebbinghaus curve
3. **Mix with audio** - Speak words aloud
4. **Export regularly** - Backup your progress
5. **Create themed decks** - Organize by topic
6. **Reset old decks** - Re-learn for long-term retention
7. **Check stats** - Monitor retention percentage

## 🚀 Advanced Features

### Data Structure
```javascript
{
  id: 1234567890,
  name: "Italian Basics",
  cards: [
    {
      front: "Ciao",
      back: "Hello",
      learned: true,
      difficulty: "easy",
      reviews: 3,
      lastReview: "2024-01-20T..."
    }
  ],
  stats: {
    totalReviews: 12,
    cardsLearned: 8,
    currentStreak: 5,
    lastReview: "2024-01-20T..."
  }
}
```

### Browser Support
- Chrome 51+
- Firefox 55+
- Safari 11+ (iOS 11.3+)
- Edge 15+

## 📈 Future Enhancements

Possible additions:
- [ ] Cloud sync across devices
- [ ] Anki deck import
- [ ] Audio pronunciation (TTS)
- [ ] Image cards support
- [ ] Collaborative deck sharing
- [ ] Achievement badges
- [ ] Study streak notifications
- [ ] Detailed analytics dashboard
- [ ] Custom review schedules
- [ ] Pronunciation practice

## 🤝 Support

Questions or issues?
- Check troubleshooting section
- Open an issue on GitHub
- Contact via email

## 📝 License

MIT License - Use freely, modify, share

## 🎓 Made For

Language learners, polyglots, students, and anyone wanting to master new vocabularies effectively with science-backed spaced repetition.

**Happy Learning! 🚀**