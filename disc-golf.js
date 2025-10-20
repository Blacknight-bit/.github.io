class DiscGolfGame {
    constructor() {
        this.players = [];
        this.currentStage = 1;
        this.totalStages = 6;
        this.parValues = [3, 3, 4, 3, 4, 2]; // Par values for stages
        this.scores = {}; // playerId -> stage -> score

        this.slides = {
            registration: document.getElementById('playerRegistration'),
            game: document.getElementById('gameSection'),
            summary: document.getElementById('summarySection'),
        };

        this.playersListReg = document.getElementById('playersListReg');
        this.playerCountReg = document.getElementById('playerCountReg');
        this.addPlayerBtnReg = document.getElementById('addPlayerBtnReg');
        this.startGameBtn = document.getElementById('startGameBtn');

        this.scorecardTable = document.getElementById('scorecardTable');
        this.currentStageSpan = document.getElementById('currentStage');
        this.currentParSpan = document.getElementById('currentPar');
        this.scorecardStage = document.getElementById('scorecardStage');
        this.scorecardPar = document.getElementById('scorecardPar');
        this.prevStageBtn = document.getElementById('prevStageBtn');
        this.nextStageBtn = document.getElementById('nextStageBtn');
        this.managePlayersBtn = document.getElementById('managePlayersBtn');
        this.playerManagementPanel = document.getElementById('playerManagementPanel');
        this.playersListManage = document.getElementById('playersListManage');
        this.closeManagementBtn = document.getElementById('closeManagementBtn');

        this.summaryFinalScores = document.getElementById('finalScores');
        this.totalParDisplay = document.getElementById('totalParDisplay');
        this.newGameBtn = document.getElementById('newGameBtn');

        this.addPlayerModal = document.getElementById('addPlayerModal');
        this.playerNameInput = document.getElementById('playerNameInput');
        this.cancelAddPlayer = document.getElementById('cancelAddPlayer');
        this.confirmAddPlayer = document.getElementById('confirmAddPlayer');

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateRegistrationDisplay();
    }

    bindEvents() {
        this.addPlayerBtnReg.addEventListener('click', () => this.showAddPlayerModal());
        this.startGameBtn.addEventListener('click', () => this.startGame());
        this.prevStageBtn.addEventListener('click', () => this.prevStage());
        this.nextStageBtn.addEventListener('click', () => this.nextStage());

        this.managePlayersBtn.addEventListener('click', () => this.togglePlayerManagement());

        this.closeManagementBtn.addEventListener('click', () => this.togglePlayerManagement(false));

        this.cancelAddPlayer.addEventListener('click', () => this.hideAddPlayerModal());
        this.confirmAddPlayer.addEventListener('click', () => this.addPlayer());

        this.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPlayer();
        });

        this.newGameBtn.addEventListener('click', () => this.restartGame());

        document.addEventListener('click', (e) => {
            if (e.target === this.addPlayerModal) this.hideAddPlayerModal();
        });
    }

    switchSlide(slideName) {
        Object.keys(this.slides).forEach(name => {
            const element = this.slides[name];
            if (name === slideName) {
                element.classList.add('active-slide');
            } else {
                element.classList.remove('active-slide');
            }
        });
    }

    showAddPlayerModal() {
        if (this.players.length >= 10) {
            alert('Maximum 10 players allowed!');
            return;
        }
        this.playerNameInput.value = '';
        this.addPlayerModal.classList.add('show');
        this.playerNameInput.focus();
    }

    hideAddPlayerModal() {
        this.addPlayerModal.classList.remove('show');
    }

    addPlayer() {
        const name = this.playerNameInput.value.trim();
        if (!name) {
            alert('Please enter a player name!');
            return;
        }
        if (this.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            alert('Player name already exists!');
            return;
        }

        const playerId = Date.now().toString();
        this.players.push({ id: playerId, name });
        this.scores[playerId] = {};
        this.hideAddPlayerModal();
        this.updateRegistrationDisplay();
    }

    updateRegistrationDisplay() {
        this.playerCountReg.textContent = this.players.length;
        if (this.players.length === 0) {
            this.playersListReg.innerHTML = '<p style="text-align:center; color:#666; padding:20px;">No players added yet</p>';
            this.startGameBtn.disabled = true;
        } else {
            this.playersListReg.innerHTML = this.players.map(p => 
                `<div class="player-item"><span class="player-name">${p.name}</span></div>`
            ).join('');
            this.startGameBtn.disabled = false;
        }
    }

    startGame() {
        if (this.players.length === 0) {
            alert('Add at least one player to start.');
            return;
        }
        this.currentStage = 1;
        this.scores = {};
        this.players.forEach(p => this.scores[p.id] = {});
        this.switchSlide('game');
        this.updateDisplay();
    }

    updateDisplay() {
        this.updateStageInfo();
        this.updateScorecard();
        this.updateNavigation();
        this.playerManagementPanel.classList.remove('show');
        this.updatePlayerManagementList();
    }

    updateStageInfo() {
        this.currentStageSpan.textContent = this.currentStage;
        this.currentParSpan.textContent = this.parValues[this.currentStage - 1];
        this.scorecardStage.textContent = this.currentStage;
        this.scorecardPar.textContent = this.parValues[this.currentStage - 1];
    }

    updateScorecard() {
        if (this.players.length === 0) {
            this.scorecardTable.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Add players to start scoring</p>';
            return;
        }
        const currentPar = this.parValues[this.currentStage - 1];
        let html = `<div class="scorecard-grid" style="grid-template-columns: 1fr repeat(${this.players.length}, 1fr);">
            <div class="scorecard-header-cell">Player</div>`;
        this.players.forEach(player => {
            html += `<div class="scorecard-header-cell">${player.name}</div>`;
        });
        html += `<div class="scorecard-player">Stage ${this.currentStage}</div>`;
        this.players.forEach(player => {
            const currentScore = this.scores[player.id][this.currentStage] || '';
            const scoreClass = this.getScoreClass(currentScore, currentPar);
            html += `<input type="number" 
                    class="score-input ${scoreClass}" 
                    value="${currentScore}" 
                    min="1" max="20"
                    onchange="game.updateScore('${player.id}', ${this.currentStage}, this.value)"
                    placeholder="0">`;
        });
        html += '</div>';
        this.scorecardTable.innerHTML = html;
    }

    updateScore(playerId, stage, score) {
        const val = parseInt(score, 10);
        if (val > 0) {
            this.scores[playerId][stage] = val;
        } else {
            delete this.scores[playerId][stage];
        }
        this.updatePlayerTotals();
    }

    updatePlayerTotals() {}

    getScoreClass(score, par) {
        if (!score) return '';
        const diff = score - par;
        if (diff === -2) return 'eagle';
        if (diff === -1) return 'birdie';
        if (diff === 0) return 'par';
        if (diff >= 1) return 'bogey';
        return '';
    }

    canProgressToNextStage() {
        if (this.players.length === 0) return false;
        for (let player of this.players) {
            const score = this.scores[player.id][this.currentStage];
            if (!score || score <= 0) return false;
        }
        return true;
    }

    nextStage() {
        if (!this.canProgressToNextStage()) {
            alert('Please enter scores for all players before proceeding!');
            return;
        }
        if (this.currentStage < this.totalStages) {
            this.currentStage++;
            this.updateDisplay();
        } else {
            this.showFinalResults();
            this.switchSlide('summary');
        }
    }

    prevStage() {
        if (this.currentStage > 1) {
            this.currentStage--;
            this.updateDisplay();
        }
    }

    updateNavigation() {
        this.prevStageBtn.disabled = this.currentStage === 1;
        if (this.currentStage === this.totalStages) {
            this.nextStageBtn.textContent = 'Finish Game';
        } else {
            this.nextStageBtn.textContent = 'Next Stage →';
        }
    }

    togglePlayerManagement(show) {
        if (show === undefined) show = !this.playerManagementPanel.classList.contains('show');
        if (show) {
            this.updatePlayerManagementList();
            this.playerManagementPanel.classList.add('show');
        } else {
            this.playerManagementPanel.classList.remove('show');
        }
    }

    updatePlayerManagementList() {
        if (this.players.length === 0) {
            this.playersListManage.innerHTML = '<p style="text-align:center; color:#666; padding:20px;">No players to manage</p>';
            return;
        }
        this.playersListManage.innerHTML = this.players.map(player => `
            <div class="player-item">
                <input type="text" value="${player.name}" 
                    data-player-id="${player.id}" 
                    class="manage-player-input" 
                    maxlength="15"
                    />
                <button class="btn btn-danger btn-sm" data-player-id="${player.id}">Delete</button>
            </div>
        `).join('');
        const inputs = this.playersListManage.querySelectorAll('.manage-player-input');
        inputs.forEach(input => {
            input.addEventListener('change', (e) => this.renamePlayer(e.target));
        });
        const deleteBtns = this.playersListManage.querySelectorAll('.btn-danger');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.deletePlayerById(e.target.dataset.playerId));
        });
    }

    renamePlayer(input) {
        const playerId = input.dataset.playerId;
        const newName = input.value.trim();
        if (!newName) {
            alert('Name cannot be empty!');
            this.updatePlayerManagementList();
            return;
        }
        if (this.players.some(p => p.id !== playerId && p.name.toLowerCase() === newName.toLowerCase())) {
            alert('Another player with this name exists!');
            this.updatePlayerManagementList();
            return;
        }
        const player = this.players.find(p => p.id === playerId);
        player.name = newName;
        this.updateDisplay();
    }

    deletePlayerById(playerId) {
        if (confirm('Are you sure you want to delete this player?')) {
            this.players = this.players.filter(p => p.id !== playerId);
            delete this.scores[playerId];
            this.updateDisplay();
            this.togglePlayerManagement();
            if (this.players.length === 0) {
                this.switchSlide('registration');
                this.updateRegistrationDisplay();
            }
        }
    }

    showFinalResults() {
        const totalPar = this.parValues.reduce((a,b) => a + b, 0);
        this.totalParDisplay.textContent = totalPar;

        const results = this.players.map(player => ({
            name: player.name,
            total: this.getPlayerTotal(player.id)
        })).sort((a,b) => a.total - b.total);

        this.summaryFinalScores.innerHTML = results.map((result, i) => {
            const cls = i === 0 ? 'first' : i === 1 ? 'second' : i === 2 ? 'third' : '';
            return `<div class="final-score-item">
                <div class="final-position ${cls}">${i+1}</div>
                <div class="final-name">${result.name}</div>
                <div class="final-total">${result.total} strokes</div>
            </div>`;
        }).join('');
    }

    getPlayerTotal(playerId) {
        let total = 0;
        for (let stage = 1; stage <= this.totalStages; stage++) {
            total += this.scores[playerId][stage] || 0;
        }
        return total;
    }

    restartGame() {
        this.players = [];
        this.scores = {};
        this.currentStage = 1;
        this.switchSlide('registration');
        this.updateRegistrationDisplay();
        this.managePlayersBtn.style.display = 'none';
    }
}

const game = new DiscGolfGame();

window.game = game; 
