// Flashcard PWA Application
const app = {
    decks: [],
    currentDeckIndex: -1,
    currentCardIndex: 0,
    learned: {},
    darkMode: localStorage.getItem('darkMode') === 'true',

    init() {
        this.loadData();
        this.setupEventListeners();
        this.registerServiceWorker();
        this.applyDarkMode();
        this.updateDecksList();
        this.updateStudyView();
    },

    // Data Management
    loadData() {
        this.decks = JSON.parse(localStorage.getItem('flashcardDecks') || '[]');
        this.learned = JSON.parse(localStorage.getItem('learnedCards') || '{}');
    },

    saveData() {
        localStorage.setItem('flashcardDecks', JSON.stringify(this.decks));
        localStorage.setItem('learnedCards', JSON.stringify(this.learned));
    },

    // View Management
    showView(viewName) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewName).classList.add('active');
        document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
        event.target.classList.add('active');
    },

    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('overlay').classList.toggle('show');
    },

    setupEventListeners() {
        document.getElementById('overlay').addEventListener('click', () => this.toggleSidebar());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.toggleSidebar();
        });
    },

    // Theme Management
    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        localStorage.setItem('darkMode', this.darkMode);
        this.applyDarkMode();
        this.updateThemeButton();
    },

    applyDarkMode() {
        if (this.darkMode) {
            document.body.classList.add('dark');
            document.getElementById('darkModeToggle').classList.add('on');
        } else {
            document.body.classList.remove('dark');
            document.getElementById('darkModeToggle').classList.remove('on');
        }
    },

    updateThemeButton() {
        document.getElementById('themeBtn').textContent = this.darkMode ? '☀️' : '🌙';
    },

    // Study Functions
    updateStudyView() {
        if (this.currentDeckIndex < 0) {
            document.getElementById('cardFront').textContent = 'Select a deck to start';
            document.getElementById('cardBack').textContent = '';
            return;
        }
        
        const deck = this.decks[this.currentDeckIndex];
        document.getElementById('deckTitle').textContent = deck.name;
        
        const deckLearned = this.learned[this.currentDeckIndex] || [];
        document.getElementById('learnedCount').textContent = deckLearned.length;
        document.getElementById('remainingCount').textContent = deck.cards.length - deckLearned.length;
        document.getElementById('totalCards').textContent = deck.cards.length;
        document.getElementById('currentCard').textContent = this.currentCardIndex + 1;
        document.getElementById('progressFill').style.width = (deckLearned.length / Math.max(deck.cards.length, 1) * 100) + '%';
        
        this.loadCard();
    },

    loadCard() {
        if (this.currentDeckIndex < 0 || this.decks[this.currentDeckIndex].cards.length === 0) return;
        
        const deck = this.decks[this.currentDeckIndex];
        const deckLearned = this.learned[this.currentDeckIndex] || [];
        const unlearnedIndices = deck.cards.map((_, i) => i).filter(i => !deckLearned.includes(i));
        
        if (unlearnedIndices.length === 0) {
            document.getElementById('cardFront').textContent = '🎉 Deck Complete!';
            document.getElementById('cardBack').textContent = 'All cards mastered!';
            this.playConfetti();
            return;
        }
        
        this.currentCardIndex = unlearnedIndices[Math.floor(Math.random() * unlearnedIndices.length)];
        const card = deck.cards[this.currentCardIndex];
        document.getElementById('cardFront').textContent = card.front;
        document.getElementById('cardBack').textContent = card.back;
        document.getElementById('cardInner').classList.remove('flipped');
    },

    flipCard() {
        document.getElementById('cardInner').classList.toggle('flipped');
    },

    skipCard() {
        this.loadCard();
    },

    markGood() {
        if (this.currentDeckIndex < 0) return;
        if (!this.learned[this.currentDeckIndex]) this.learned[this.currentDeckIndex] = [];
        if (!this.learned[this.currentDeckIndex].includes(this.currentCardIndex)) {
            this.learned[this.currentDeckIndex].push(this.currentCardIndex);
        }
        this.saveData();
        this.playConfetti();
        this.loadCard();
        this.updateStudyView();
    },

    markAgain() {
        this.loadCard();
    },

    // Deck Management
    createNewDeck() {
        const name = document.getElementById('newDeckName').value.trim();
        if (!name) {
            alert('Please enter a deck name');
            return;
        }
        
        this.decks.push({ name, cards: [] });
        this.learned[this.decks.length - 1] = [];
        this.currentDeckIndex = this.decks.length - 1;
        this.saveData();
        
        this.showMessage('Deck created! Add cards below.');
        document.getElementById('newDeckName').value = '';
        this.updateDecksList();
    },

    addCardToDeck() {
        const front = document.getElementById('cardFrontInput').value.trim();
        const back = document.getElementById('cardBackInput').value.trim();
        
        if (!front || !back) {
            alert('Please fill both fields');
            return;
        }
        
        if (this.currentDeckIndex < 0) {
            alert('Create a deck first');
            return;
        }
        
        this.decks[this.currentDeckIndex].cards.push({ front, back });
        this.saveData();
        
        document.getElementById('cardFrontInput').value = '';
        document.getElementById('cardBackInput').value = '';
        
        this.updateCurrentCardsPreview();
        this.updateStudyView();
    },

    updateCurrentCardsPreview() {
        if (this.currentDeckIndex < 0) return;
        
        const cards = this.decks[this.currentDeckIndex].cards;
        const preview = cards.map((c, i) => 
            `<div class="deck-item">
                <div class="deck-info">
                    <div class="deck-name">${this.escapeHtml(c.front)}</div>
                    <div class="deck-count">${this.escapeHtml(c.back)}</div>
                </div>
                <button class="icon-btn" onclick="app.removeCard(${i})">✕</button>
            </div>`
        ).join('');
        
        document.getElementById('currentCardsPreview').innerHTML = preview ? 
            `<h4>Cards in ${this.escapeHtml(this.decks[this.currentDeckIndex].name)}: (${cards.length})</h4>${preview}` : '';
    },

    removeCard(index) {
        if (this.currentDeckIndex < 0) return;
        this.decks[this.currentDeckIndex].cards.splice(index, 1);
        this.saveData();
        this.updateCurrentCardsPreview();
    },

    updateDecksList() {
        const html = this.decks.map((deck, i) => {
            const deckLearned = (this.learned[i] || []).length;
            const progress = Math.round((deckLearned / Math.max(deck.cards.length, 1)) * 100);
            return `<div class="deck-item" onclick="app.selectDeck(${i}); app.showView('study')">
                <div class="deck-info">
                    <div class="deck-name">${this.escapeHtml(deck.name)}</div>
                    <div class="deck-count">${deck.cards.length} cards • ${deckLearned} learned (${progress}%)</div>
                </div>
                <div class="deck-actions">
                    <button class="icon-btn" onclick="event.stopPropagation(); app.editDeck(${i})">✏️</button>
                    <button class="icon-btn" onclick="event.stopPropagation(); app.deleteDeck(${i})">🗑️</button>
                </div>
            </div>`;
        }).join('');
        
        document.getElementById('decksList').innerHTML = html || '<p style="color: #999; text-align: center; padding: 40px 20px;">No decks yet. Create one!</p>';
    },

    selectDeck(index) {
        this.currentDeckIndex = index;
        this.currentCardIndex = 0;
        this.updateStudyView();
    },

    editDeck(index) {
        this.currentDeckIndex = index;
        this.showView('create');
        this.updateCurrentCardsPreview();
    },

    deleteDeck(index) {
        if (confirm('Delete this deck? This cannot be undone.')) {
            this.decks.splice(index, 1);
            delete this.learned[index];
            this.saveData();
            this.updateDecksList();
            this.currentDeckIndex = -1;
            this.updateStudyView();
        }
    },

    // Import/Export Functions
    async importDeck() {
        const file = document.getElementById('fileInput').files[0];
        if (!file) {
            alert('Select a file');
            return;
        }
        
        try {
            const content = await file.text();
            let cards = [];
            
            if (file.name.endsWith('.csv')) {
                cards = content.split('\n').slice(1).filter(line => line.trim()).map(line => {
                    const [front, back] = line.split(',').map(s => s.trim());
                    return { front, back };
                });
            } else if (file.name.endsWith('.json')) {
                const data = JSON.parse(content);
                if (Array.isArray(data)) cards = data;
                else if (data.cards) cards = data.cards;
                else if (data.decks && data.decks[0] && data.decks[0].cards) cards = data.decks[0].cards;
            } else if (file.name.endsWith('.txt')) {
                const lines = content.split('\n').filter(line => line.trim());
                cards = [];
                for (let i = 0; i < lines.length; i += 2) {
                    if (lines[i + 1]) {
                        cards.push({ front: lines[i], back: lines[i + 1] });
                    }
                }
            }
            
            if (cards.length === 0) {
                alert('No cards found in file');
                return;
            }
            
            const deckName = file.name.replace(/\.[^/.]+$/, '');
            this.decks.push({ name: deckName, cards });
            this.learned[this.decks.length - 1] = [];
            this.saveData();
            
            this.showMessage(`✓ Imported ${cards.length} cards!`);
            this.updateDecksList();
            document.getElementById('fileInput').value = '';
        } catch (err) {
            alert('Error importing file: ' + err.message);
        }
    },

    async generateDeck() {
        const topic = document.getElementById('aiTopic').value.trim();
        if (!topic) {
            alert('Enter a topic');
            return;
        }
        
        const apiKey = document.getElementById('apiKey').value.trim();
        const deckName = document.getElementById('generatedDeckName').value.trim() || topic;
        
        if (!apiKey) {
            // Demo mode - generate sample cards
            const demoCards = [
                { front: 'Ciao', back: 'Hello' },
                { front: 'Grazie', back: 'Thank you' },
                { front: 'Per favore', back: 'Please' },
                { front: 'Scusa', back: 'Excuse me' },
                { front: 'Sì', back: 'Yes' },
                { front: 'No', back: 'No' },
                { front: 'Mi chiamo', back: 'My name is' },
                { front: 'Quanto costa?', back: 'How much does it cost?' }
            ];
            this.showGeneratedPreview(demoCards, deckName);
            return;
        }
        
        this.showLoadingMessage('Generating with AI... (this may take a moment)');
        
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{
                        role: 'user',
                        content: `Generate 25 flashcard pairs for learning "${topic}". 
                        Format each as: FRONT|BACK (exactly one pair per line)
                        Make them practical and ordered by difficulty.
                        Example format: Ciao|Hello`
                    }],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            const content = data.choices[0].message.content;
            const cards = content.split('\n')
                .filter(line => line.includes('|'))
                .slice(0, 30)
                .map(line => {
                    const [front, back] = line.split('|').map(s => s.trim());
                    return front && back ? { front, back } : null;
                })
                .filter(c => c);
            
            if (cards.length === 0) {
                throw new Error('No valid cards generated');
            }
            
            this.showGeneratedPreview(cards, deckName);
        } catch (err) {
            alert('Error generating deck: ' + err.message);
            document.getElementById('generatedPreview').innerHTML = '';
        }
    },

    showGeneratedPreview(cards, deckName) {
        const html = `<div style="background: white; padding: 20px; border-radius: 10px; margin-top: 20px;">
            <h4>${this.escapeHtml(deckName)} (${cards.length} cards)</h4>
            <div style="max-height: 300px; overflow-y: auto; margin: 15px 0;">
                ${cards.map(c => `<div class="deck-item">
                    <div class="deck-info">
                        <div class="deck-name">${this.escapeHtml(c.front)}</div>
                        <div class="deck-count">${this.escapeHtml(c.back)}</div>
                    </div>
                </div>`).join('')}
            </div>
            <button onclick="app.saveGeneratedDeck('${this.escapeHtml(deckName)}', ${JSON.stringify(cards).replace(/'/g, "&apos;")})" style="width: 100%; margin-bottom: 10px;">✓ Save Deck</button>
            <button onclick="document.getElementById('generatedPreview').innerHTML = ''" class="secondary" style="width: 100%;">Cancel</button>
        </div>`;
        document.getElementById('generatedPreview').innerHTML = html;
    },

    saveGeneratedDeck(name, cards) {
        this.decks.push({ name, cards });
        this.learned[this.decks.length - 1] = [];
        this.saveData();
        
        this.showMessage('✓ Deck saved!');
        this.updateDecksList();
        document.getElementById('aiTopic').value = '';
        document.getElementById('generatedDeckName').value = '';
        document.getElementById('apiKey').value = '';
        document.getElementById('generatedPreview').innerHTML = '';
    },

    exportAllData() {
        const data = {
            decks: this.decks,
            learned: this.learned,
            exported: new Date().toISOString(),
            version: '1.0'
        };
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flashcards-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showMessage('✓ Data exported!');
    },

    clearAllData() {
        if (confirm('Delete ALL decks and progress? This cannot be undone.')) {
            localStorage.clear();
            this.decks = [];
            this.learned = {};
            this.currentDeckIndex = -1;
            this.updateDecksList();
            this.updateStudyView();
            this.showMessage('✓ All data cleared');
        }
    },

    // UI Effects
    playConfetti() {
        const emojis = ['🎉', '⭐', '🎊', '✨', '🌟', '💫'];
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-20px';
            confetti.style.opacity = Math.random() * 0.5 + 0.5;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }
    },

    showMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'success-message';
        msg.textContent = text;
        msg.style.position = 'fixed';
        msg.style.bottom = '20px';
        msg.style.right = '20px';
        msg.style.maxWidth = '300px';
        msg.style.zIndex = '2001';
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 3000);
    },

    showLoadingMessage(text) {
        const msg = document.createElement('div');
        msg.style.position = 'fixed';
        msg.style.top = '50%';
        msg.style.left = '50%';
        msg.style.transform = 'translate(-50%, -50%)';
        msg.style.background = 'white';
        msg.style.padding = '30px';
        msg.style.borderRadius = '15px';
        msg.style.boxShadow = '0 10px 40px rgba(0,0,0,0.2)';
        msg.style.zIndex = '3000';
        msg.innerHTML = `<div class="loading"></div>${text}`;
        document.body.appendChild(msg);
        return msg;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // PWA Setup
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            const swCode = `
self.addEventListener('install', (e) => {
    e.waitUntil(caches.open('flashcards-v1').then((cache) => {
        return cache.addAll(['/index.html', '/']);
    }));
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
            if (key !== 'flashcards-v1') {
                return caches.delete(key);
            }
        }));
    }));
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(caches.match(e.request).then((response) => {
        return response || fetch(e.request);
    }));
});
            `;
            const blob = new Blob([swCode], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            navigator.serviceWorker.register(url).catch(() => {});
        }
    }
};

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});