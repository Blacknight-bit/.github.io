// Flashcard PWA - Application Logic
class FlashcardApp {
    constructor() {
        this.decks = this.loadDecks();
        this.currentDeck = null;
        this.currentCardIndex = 0;
        this.sessionStats = {
            easy: 0,
            hard: 0,
            skipped: 0
        };
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupEventListeners();
        this.showView('home');
        this.updateDecksList();
    }

    // ===== Service Worker =====
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(() => {});
        }
    }

    // ===== View Management =====
    showView(viewName) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewName).classList.add('active');
        
        // Close sidebar when switching views
        document.querySelector('.sidebar').classList.remove('open');
        document.querySelector('.overlay').classList.remove('show');

        // Load analytics if needed
        if (viewName === 'analytics') {
            this.loadAnalytics();
        }
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('menuBtn').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.add('open');
            document.querySelector('.overlay').classList.add('show');
        });

        document.querySelector('.close-sidebar').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.remove('open');
            document.querySelector('.overlay').classList.remove('show');
        });

        document.querySelector('.overlay').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.remove('open');
            document.querySelector('.overlay').classList.remove('show');
        });

        // Navigation links
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.showView(view);
            });
        });

        // Home view buttons
        document.getElementById('createDeckBtn').addEventListener('click', () => this.showView('create'));
        document.getElementById('importBtn').addEventListener('click', () => this.showView('import'));

        // Create deck form
        document.getElementById('createForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createDeck();
        });

        // Add card to deck form
        document.getElementById('addCardForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCard();
        });

        // Rename deck buttons
        document.getElementById('renameDeckBtn').addEventListener('click', () => this.toggleRenameForm());
        document.getElementById('saveDeckName').addEventListener('click', () => this.saveDeckName());
        document.getElementById('cancelDeckName').addEventListener('click', () => this.toggleRenameForm());

        // Study mode
        document.getElementById('studyContainer').addEventListener('click', (e) => {
            if (e.target.closest('.card-container')) {
                document.querySelector('.card-inner').classList.toggle('flipped');
            }
        });

        // Study buttons
        document.getElementById('easyBtn').addEventListener('click', () => this.cardResponse('easy'));
        document.getElementById('hardBtn').addEventListener('click', () => this.cardResponse('hard'));
        document.getElementById('skipBtn').addEventListener('click', () => this.cardResponse('skip'));
        document.getElementById('finishBtn').addEventListener('click', () => this.finishStudySession());

        // Import file handler
        document.getElementById('importFileBtn').addEventListener('click', () => this.handleFileImport());

        // Settings
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('clearBtn').addEventListener('click', () => {
            if (confirm('Are you sure? This cannot be undone!')) {
                localStorage.clear();
                this.decks = [];
                this.updateDecksList();
                alert('All data cleared!');
            }
        });
    }

    // ===== Rename Deck Feature =====
    toggleRenameForm() {
        const form = document.getElementById('renameForm');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
        if (form.style.display === 'block') {
            document.getElementById('newDeckName').value = this.currentDeck.name;
            document.getElementById('newDeckName').focus();
        }
    }

    saveDeckName() {
        const newName = document.getElementById('newDeckName').value.trim();
        if (!newName) {
            alert('Deck name cannot be empty');
            return;
        }

        if (this.currentDeck) {
            this.currentDeck.name = newName;
            this.saveDecks();
            this.updateEditDeckView();
            this.toggleRenameForm();
            this.updateDecksList();
        }
    }

    // ===== Deck Management =====
    createDeck() {
        const name = document.getElementById('deckName').value.trim();
        if (!name) {
            alert('Please enter a deck name');
            return;
        }

        const deck = {
            id: Date.now(),
            name: name,
            cards: [],
            createdDate: new Date().toISOString(),
            stats: {
                totalReviews: 0,
                cardsLearned: 0,
                currentStreak: 0,
                lastReview: null,
                totalStudySessions: 0,
                averageAccuracy: 0
            }
        };

        this.decks.push(deck);
        this.currentDeck = deck;
        this.saveDecks();
        this.showView('editDeck');
        this.updateEditDeckView();
        document.getElementById('deckName').value = '';
    }

    updateEditDeckView() {
        if (!this.currentDeck) return;

        document.getElementById('editDeckTitle').textContent = this.currentDeck.name;
        const cardsList = document.getElementById('cardsList');
        cardsList.innerHTML = '';

        this.currentDeck.cards.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'deck-item';
            cardEl.innerHTML = `
                <div class="deck-info">
                    <div class="deck-name">${this.escapeHtml(card.front)}</div>
                    <div class="deck-count">${this.escapeHtml(card.back)}</div>
                </div>
                <button class="icon-btn" onclick="app.deleteCard(${index})">🗑️</button>
            `;
            cardsList.appendChild(cardEl);
        });

        document.getElementById('cardCount').textContent = `Cards: ${this.currentDeck.cards.length}`;
    }

    addCard() {
        if (!this.currentDeck) return;

        const front = document.getElementById('cardFront').value.trim();
        const back = document.getElementById('cardBack').value.trim();

        if (!front || !back) {
            alert('Please fill in both fields');
            return;
        }

        this.currentDeck.cards.push({
            front: front,
            back: back,
            learned: false,
            difficulty: 'new',
            reviews: 0,
            lastReview: null,
            nextReviewDate: new Date().toISOString()
        });

        this.saveDecks();
        this.updateEditDeckView();
        document.getElementById('cardFront').value = '';
        document.getElementById('cardBack').value = '';
    }

    deleteCard(index) {
        if (this.currentDeck && confirm('Delete this card?')) {
            this.currentDeck.cards.splice(index, 1);
            this.saveDecks();
            this.updateEditDeckView();
        }
    }

    selectDeckFromList(deckId) {
        this.currentDeck = this.decks.find(d => d.id === deckId);
    }

    viewDeck(deckId) {
        this.selectDeckFromList(deckId);
        this.showView('editDeck');
        this.updateEditDeckView();
    }

    startStudy(deckId) {
        this.selectDeckFromList(deckId);
        if (!this.currentDeck) return;

        this.currentCardIndex = 0;
        this.sessionStats = { easy: 0, hard: 0, skipped: 0 };
        this.showView('study');
        this.displayCard();
    }

    displayCard() {
        if (!this.currentDeck || this.currentCardIndex >= this.currentDeck.cards.length) {
            this.finishStudySession();
            return;
        }

        const card = this.currentDeck.cards[this.currentCardIndex];
        document.querySelector('.card-front').textContent = card.front;
        document.querySelector('.card-back').textContent = card.back;
        document.querySelector('.card-inner').classList.remove('flipped');

        const progress = ((this.currentCardIndex + 1) / this.currentDeck.cards.length) * 100;
        document.getElementById('studyProgress').style.width = progress + '%';
        document.getElementById('cardCounter').textContent = `${this.currentCardIndex + 1}/${this.currentDeck.cards.length}`;
    }

    cardResponse(response) {
        const card = this.currentDeck.cards[this.currentCardIndex];
        const now = new Date();
        
        if (response === 'easy') {
            card.learned = true;
            card.difficulty = 'easy';
            card.nextReviewDate = this.calculateNextReviewDate(now, 1);
            this.sessionStats.easy++;
        } else if (response === 'hard') {
            card.learned = false;
            card.difficulty = 'hard';
            card.nextReviewDate = this.calculateNextReviewDate(now, 0);
            this.sessionStats.hard++;
        } else if (response === 'skip') {
            this.sessionStats.skipped++;
        }

        card.reviews++;
        card.lastReview = now.toISOString();

        this.saveDecks();
        this.currentCardIndex++;
        this.displayCard();
    }

    calculateNextReviewDate(currentDate, reviewLevel) {
        // Ebbinghaus spaced repetition algorithm
        let daysUntilReview = 0;
        
        if (reviewLevel === 1) {
            // Easy - follow full Ebbinghaus curve
            const reviewCount = (this.currentDeck.cards[this.currentCardIndex]?.reviews || 0) + 1;
            const intervals = [1, 3, 7, 14, 30];
            daysUntilReview = intervals[Math.min(reviewCount - 1, intervals.length - 1)] || 30;
        } else {
            // Hard - review sooner
            daysUntilReview = 1;
        }

        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + daysUntilReview);
        return nextDate.toISOString();
    }

    forgetDeck(deckId) {
        const deck = this.decks.find(d => d.id === deckId);
        if (!deck) return;

        if (confirm(`Are you sure you want to reset "${deck.name}"? All progress will be lost.`)) {
            deck.cards.forEach(card => {
                card.learned = false;
                card.difficulty = 'new';
                card.reviews = 0;
                card.lastReview = null;
                card.nextReviewDate = new Date().toISOString();
            });
            deck.stats = {
                totalReviews: 0,
                cardsLearned: 0,
                currentStreak: 0,
                lastReview: null,
                totalStudySessions: 0,
                averageAccuracy: 0
            };
            this.saveDecks();
            this.updateDecksList();
            alert(`Deck "${deck.name}" has been reset!`);
        }
    }

    finishStudySession() {
        if (!this.currentDeck) return;

        // Update deck stats
        const totalCards = this.sessionStats.easy + this.sessionStats.hard + this.sessionStats.skipped;
        const accuracy = totalCards > 0 ? ((this.sessionStats.easy / totalCards) * 100).toFixed(1) : 0;

        this.currentDeck.stats.totalReviews += totalCards;
        this.currentDeck.stats.cardsLearned = this.currentDeck.cards.filter(c => c.learned).length;
        this.currentDeck.stats.lastReview = new Date().toISOString();
        this.currentDeck.stats.totalStudySessions += 1;
        this.currentDeck.stats.averageAccuracy = accuracy;

        this.saveDecks();
        this.showStudyResults();
    }

    showStudyResults() {
        const resultsView = document.getElementById('results');
        resultsView.innerHTML = `
            <div style="text-align: center; padding: 30px 20px;">
                <h2>🎉 Session Complete!</h2>
                <div class="stats-grid" style="margin: 30px 0;">
                    <div class="stat-card">
                        <h4>Easy</h4>
                        <div class="value" style="color: #4caf50;">${this.sessionStats.easy}</div>
                    </div>
                    <div class="stat-card">
                        <h4>Hard</h4>
                        <div class="value" style="color: #ff9800;">${this.sessionStats.hard}</div>
                    </div>
                    <div class="stat-card">
                        <h4>Skipped</h4>
                        <div class="value" style="color: #9e9e9e;">${this.sessionStats.skipped}</div>
                    </div>
                    <div class="stat-card">
                        <h4>Learned Cards</h4>
                        <div class="value">${this.currentDeck.stats.cardsLearned}/${this.currentDeck.cards.length}</div>
                    </div>
                </div>
                ${this.generateForgettingCurveInfo()}
                <button onclick="app.showView('home')" style="margin-top: 20px;">Back to Home</button>
            </div>
        `;
        this.showView('results');
        this.createConfetti();
    }

    generateForgettingCurveInfo() {
        const learnedCards = this.currentDeck.cards.filter(c => c.learned);
        if (learnedCards.length === 0) return '';

        // Ebbinghaus forgetting curve simulation
        const now = new Date();
        let html = '<div class="forgetting-curve"><h3>Next Review Schedule (Ebbinghaus Curve)</h3>';

        const schedules = [
            { days: 1, retention: 90 },
            { days: 3, retention: 72 },
            { days: 7, retention: 54 },
            { days: 14, retention: 35 },
            { days: 30, retention: 21 }
        ];

        schedules.forEach(schedule => {
            const nextDate = new Date(now.getTime() + schedule.days * 24 * 60 * 60 * 1000);
            html += `
                <div class="curve-info">
                    <span>Day ${schedule.days}: ${nextDate.toLocaleDateString()}</span>
                    <span>${schedule.retention}% retention</span>
                </div>
                <div class="curve-bar">
                    <div class="curve-fill" style="width: ${schedule.retention}%">${schedule.retention}%</div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    showDeckStats(deckId) {
        const deck = this.decks.find(d => d.id === deckId);
        if (!deck) return;

        const learnedCount = deck.cards.filter(c => c.learned).length;
        const totalCount = deck.cards.length;
        const retention = totalCount > 0 ? ((learnedCount / totalCount) * 100).toFixed(1) : 0;

        const statsView = document.getElementById('deckStats');
        statsView.innerHTML = `
            <div style="padding: 20px;">
                <h2>${this.escapeHtml(deck.name)} - Statistics</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h4>Total Cards</h4>
                        <div class="value">${totalCount}</div>
                    </div>
                    <div class="stat-card">
                        <h4>Learned</h4>
                        <div class="value">${learnedCount}</div>
                    </div>
                    <div class="stat-card">
                        <h4>Retention</h4>
                        <div class="value">${retention}%</div>
                    </div>
                    <div class="stat-card">
                        <h4>Total Reviews</h4>
                        <div class="value">${deck.stats.totalReviews}</div>
                    </div>
                </div>
                <div class="progress-container">
                    <p>Overall Progress</p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${retention}%"></div>
                    </div>
                </div>
                ${this.generateForgettingCurveInfo()}
                <button onclick="app.showView('home')" style="margin-top: 20px;">Back</button>
            </div>
        `;
        this.showView('deckStats');
    }

    // ===== Analytics Page =====
    loadAnalytics() {
        if (this.decks.length === 0) {
            document.getElementById('analyticsContent').innerHTML = '<p style="text-align: center; color: #999;">No decks to analyze. Create one first!</p>';
            return;
        }

        let totalCards = 0;
        let totalLearned = 0;
        let totalReviews = 0;
        let totalSessions = 0;

        this.decks.forEach(deck => {
            totalCards += deck.cards.length;
            totalLearned += deck.cards.filter(c => c.learned).length;
            totalReviews += deck.stats.totalReviews;
            totalSessions += deck.stats.totalStudySessions;
        });

        const overallRetention = totalCards > 0 ? ((totalLearned / totalCards) * 100).toFixed(1) : 0;
        const averageCardsPerDeck = (totalCards / this.decks.length).toFixed(1);

        let html = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Total Decks</h4>
                    <div class="value">${this.decks.length}</div>
                </div>
                <div class="stat-card">
                    <h4>Total Cards</h4>
                    <div class="value">${totalCards}</div>
                </div>
                <div class="stat-card">
                    <h4>Cards Learned</h4>
                    <div class="value">${totalLearned}</div>
                </div>
                <div class="stat-card">
                    <h4>Overall Retention</h4>
                    <div class="value">${overallRetention}%</div>
                </div>
                <div class="stat-card">
                    <h4>Total Reviews</h4>
                    <div class="value">${totalReviews}</div>
                </div>
                <div class="stat-card">
                    <h4>Study Sessions</h4>
                    <div class="value">${totalSessions}</div>
                </div>
                <div class="stat-card">
                    <h4>Avg Cards/Deck</h4>
                    <div class="value">${averageCardsPerDeck}</div>
                </div>
                <div class="stat-card">
                    <h4>Avg Reviews/Deck</h4>
                    <div class="value">${(totalReviews / this.decks.length).toFixed(1)}</div>
                </div>
            </div>

            <h3 style="margin-top: 30px;">📚 Deck Details</h3>
        `;

        this.decks.forEach(deck => {
            const deckRetention = deck.cards.length > 0 ? ((deck.cards.filter(c => c.learned).length / deck.cards.length) * 100).toFixed(1) : 0;
            const nextReviewCards = this.getCardsNeedingReview(deck).length;

            html += `
                <div style="background: #1e1e2e; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                    <h4>${this.escapeHtml(deck.name)}</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
                        <div>Cards: ${deck.cards.length}</div>
                        <div>Learned: ${deck.cards.filter(c => c.learned).length}</div>
                        <div>Retention: ${deckRetention}%</div>
                        <div>Reviews: ${deck.stats.totalReviews}</div>
                        <div>Sessions: ${deck.stats.totalStudySessions}</div>
                        <div>Needs Review: ${nextReviewCards}</div>
                    </div>
                </div>
            `;
        });

        html += `
            <h3 style="margin-top: 30px;">📈 Spaced Repetition Schedule</h3>
            <div style="background: #1e1e2e; padding: 15px; border-radius: 10px;">
                <p style="margin-top: 0;">Based on Ebbinghaus Forgetting Curve:</p>
                <ul style="color: #cbd5e1; line-height: 1.8;">
                    <li><strong>Day 1:</strong> 90% retention - Review immediately</li>
                    <li><strong>Day 3:</strong> 72% retention - Review in 3 days</li>
                    <li><strong>Day 7:</strong> 54% retention - Review in 1 week</li>
                    <li><strong>Day 14:</strong> 35% retention - Review in 2 weeks</li>
                    <li><strong>Day 30:</strong> 21% retention - Review in 1 month</li>
                </ul>
            </div>

            <h3 style="margin-top: 30px;">🎯 Study Tips</h3>
            <div style="background: #1e1e2e; padding: 15px; border-radius: 10px;">
                <ul style="color: #cbd5e1; line-height: 1.8;">
                    <li>Study for 15 minutes daily rather than 2 hours once a week</li>
                    <li>Follow the Ebbinghaus schedule for maximum retention</li>
                    <li>Mark cards as "Easy" when you know them well</li>
                    <li>Use "Hard" for cards you need to practice more</li>
                    <li>Review before the suggested dates for better results</li>
                </ul>
            </div>
        `;

        document.getElementById('analyticsContent').innerHTML = html;
    }

    getCardsNeedingReview(deck) {
        const now = new Date();
        return deck.cards.filter(card => {
            if (!card.nextReviewDate) return false;
            return new Date(card.nextReviewDate) <= now;
        });
    }

    // ===== Import/Export =====
    handleFileImport() {
        const fileInput = document.getElementById('importFile');
        const customName = document.getElementById('importDeckName').value.trim();
        const file = fileInput.files[0];

        if (!file) {
            alert('Please select a file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const fileName = file.name.toLowerCase();

                let decks = [];

                if (fileName.endsWith('.json')) {
                    decks = this.parseJson(content);
                } else if (fileName.endsWith('.csv')) {
                    decks = this.parseCsv(content);
                } else if (fileName.endsWith('.txt')) {
                    decks = this.parseTxt(content);
                } else {
                    alert('Unsupported file format');
                    return;
                }

                if (decks.length === 0) {
                    alert('No valid decks found in file');
                    return;
                }

                // Add imported decks
                decks.forEach((deck, index) => {
                    // Use custom name if provided (only for single deck)
                    if (customName && decks.length === 1) {
                        deck.name = customName;
                    }
                    // Otherwise use default or existing name

                    deck.id = Date.now() + Math.random();
                    deck.createdDate = new Date().toISOString();
                    deck.stats = {
                        totalReviews: 0,
                        cardsLearned: 0,
                        currentStreak: 0,
                        lastReview: null,
                        totalStudySessions: 0,
                        averageAccuracy: 0
                    };

                    // Initialize card fields
                    deck.cards.forEach(card => {
                        if (!card.nextReviewDate) {
                            card.nextReviewDate = new Date().toISOString();
                        }
                    });

                    this.decks.push(deck);
                });

                this.saveDecks();
                this.updateDecksList();
                fileInput.value = '';
                document.getElementById('importDeckName').value = '';
                this.showView('home');
                alert(`Successfully imported ${decks.length} deck(s)!`);
            } catch (error) {
                alert('Error importing file: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    parseJson(content) {
        const data = JSON.parse(content);
        if (!data.decks || !Array.isArray(data.decks)) {
            throw new Error('Invalid JSON format. Expected "decks" array.');
        }

        return data.decks.map(deck => ({
            name: deck.name || 'Imported Deck',
            cards: (deck.cards || []).map(card => ({
                front: card.front || '',
                back: card.back || '',
                learned: card.learned || false,
                difficulty: card.difficulty || 'new',
                reviews: card.reviews || 0,
                lastReview: card.lastReview || null,
                nextReviewDate: card.nextReviewDate || new Date().toISOString()
            }))
        }));
    }

    parseCsv(content) {
        const lines = content.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('CSV file must have at least a header and one data row');
        }

        const cards = [];
        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const [front, back] = lines[i].split(',').map(s => s.trim());
            if (front && back) {
                cards.push({
                    front: front,
                    back: back,
                    learned: false,
                    difficulty: 'new',
                    reviews: 0,
                    lastReview: null,
                    nextReviewDate: new Date().toISOString()
                });
            }
        }

        if (cards.length === 0) {
            throw new Error('No valid cards found in CSV');
        }

        return [{
            name: 'Imported CSV Deck',
            cards: cards
        }];
    }

    parseTxt(content) {
        const lines = content.trim().split('\n').filter(line => line.trim());
        
        if (lines.length < 2 || lines.length % 2 !== 0) {
            throw new Error('TXT file must have pairs of lines (front and back alternating)');
        }

        const cards = [];
        for (let i = 0; i < lines.length; i += 2) {
            cards.push({
                front: lines[i].trim(),
                back: lines[i + 1].trim(),
                learned: false,
                difficulty: 'new',
                reviews: 0,
                lastReview: null,
                nextReviewDate: new Date().toISOString()
            });
        }

        return [{
            name: 'Imported TXT Deck',
            cards: cards
        }];
    }

    exportData() {
        const data = JSON.stringify(this.decks, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flashcards-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ===== Data Persistence =====
    saveDecks() {
        localStorage.setItem('flashcards_decks', JSON.stringify(this.decks));
    }

    loadDecks() {
        const data = localStorage.getItem('flashcards_decks');
        return data ? JSON.parse(data) : [];
    }

    // ===== UI Helpers =====
    updateDecksList() {
        const list = document.getElementById('decksList');
        list.innerHTML = '';

        if (this.decks.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #999;">No decks yet. Create one to get started!</p>';
            return;
        }

        this.decks.forEach(deck => {
            const learned = deck.cards.filter(c => c.learned).length;
            const total = deck.cards.length;
            const needsReview = this.getCardsNeedingReview(deck).length;
            
            const item = document.createElement('div');
            item.className = 'deck-item';
            item.innerHTML = `
                <div class="deck-info">
                    <div class="deck-name">${this.escapeHtml(deck.name)}</div>
                    <div class="deck-count">${learned}/${total} cards learned${needsReview > 0 ? ` • ${needsReview} need review` : ''}</div>
                </div>
                <div class="deck-actions">
                    <button class="icon-btn" title="View" onclick="app.viewDeck(${deck.id})">👁️</button>
                    <button class="icon-btn" title="Stats" onclick="app.showDeckStats(${deck.id})">📊</button>
                    <button class="icon-btn" title="Study" onclick="app.startStudy(${deck.id})">📚</button>
                    <button class="icon-btn" title="Reset" onclick="app.forgetDeck(${deck.id})">🔄</button>
                    <button class="icon-btn" title="Delete" onclick="app.deleteDeck(${deck.id})">🗑️</button>
                </div>
            `;
            list.appendChild(item);
        });
    }

    deleteDeck(deckId) {
        const deck = this.decks.find(d => d.id === deckId);
        if (deck && confirm(`Delete "${deck.name}"?`)) {
            this.decks = this.decks.filter(d => d.id !== deckId);
            this.saveDecks();
            this.updateDecksList();
        }
    }

    createConfetti() {
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.textContent = ['🎉', '✨', '⭐', '🌟', '🎊'][Math.floor(Math.random() * 5)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app
const app = new FlashcardApp();

// Dark mode is always enabled
document.body.classList.add('dark');