import { translations } from './translations.js';
import { performanceTracker } from './performance.js';

export class UI {
    constructor() {
        this.optionsContainer = document.getElementById('options-container');
        this.instructionEl = document.querySelector('.instruction-text');

        // Containers
        this.mainMenu = document.getElementById('main-menu');
        this.gameArea = document.querySelector('.game-area');
        this.staffWrapper = document.querySelector('.staff-wrapper');
        this.ordinanceContainer = document.getElementById('ordinance-container');
        this.statsContainer = document.getElementById('stats-container');

        // Shuffle Toggle
        this.shuffleToggle = document.getElementById('shuffle-toggle');
        this.isShuffled = false;

        // Language
        this.currentLang = 'en';
        this.langToggle = document.getElementById('lang-toggle');

        this.solfegeOptions = ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'];

        this.bindMenuButtons();
        this.bindShuffleToggle();
        this.bindLangToggle();

        // Initial translation
        this.updateTexts();
    }

    bindMenuButtons() {
        document.getElementById('btn-relative').addEventListener('click', () => {
            this.showGame('relative');
            if (this.onModeSelect) this.onModeSelect('relative');
        });
        document.getElementById('btn-ordinance').addEventListener('click', () => {
            this.showGame('ordinance');
            if (this.onModeSelect) this.onModeSelect('ordinance');
        });
        document.getElementById('btn-stats').addEventListener('click', () => {
            this.showStats();
        });
        document.getElementById('btn-back').addEventListener('click', () => {
            this.showMenu();
            if (this.onBackToMenu) this.onBackToMenu();
        });
    }

    bindShuffleToggle() {
        this.shuffleToggle.addEventListener('change', (e) => {
            this.isShuffled = e.target.checked;
            this.renderOptions(); // Re-render immediately
        });
    }

    bindLangToggle() {
        this.langToggle.addEventListener('click', () => {
            this.currentLang = this.currentLang === 'en' ? 'fr' : 'en';
            this.langToggle.textContent = this.currentLang === 'en' ? 'FR' : 'EN';
            this.updateTexts();
            // Re-render instructions if active
            if (this.lastInstructionKey) {
                this.setInstruction(this.lastInstructionKey, this.lastInstructionParams);
            }
        });
    }

    updateTexts() {
        const t = translations[this.currentLang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) {
                el.textContent = t[key];
            }
        });
    }

    bindModeSelect(callback) {
        this.onModeSelect = callback;
    }

    bindBackToMenu(callback) {
        this.onBackToMenu = callback;
    }

    showMenu() {
        this.mainMenu.style.display = 'flex';
        this.gameArea.style.display = 'none';
        this.statsContainer.style.display = 'none';
        document.getElementById('btn-back').style.display = 'none';
    }

    showGame(mode) {
        this.mainMenu.style.display = 'none';
        this.gameArea.style.display = 'flex';
        this.statsContainer.style.display = 'none';
        document.getElementById('btn-back').style.display = 'block';

        if (mode === 'relative') {
            this.staffWrapper.style.display = 'flex';
            this.ordinanceContainer.style.display = 'none';
            this.renderOptions();
        } else {
            this.staffWrapper.style.display = 'none';
            this.ordinanceContainer.style.display = 'flex';
            this.renderOptions();
        }
    }

    bindOptionButtons(callback) {
        this.onOptionSelected = callback;
    }

    setInstruction(key, params = {}) {
        this.lastInstructionKey = key;
        this.lastInstructionParams = params;

        if (this.instructionEl) {
            let text = translations[this.currentLang][key] || key;
            // Replace params like {ref}
            for (const [pKey, pVal] of Object.entries(params)) {
                text = text.replace(`{${pKey}}`, pVal);
            }
            this.instructionEl.textContent = text;
        }
    }

    renderOptions() {
        this.optionsContainer.innerHTML = '';

        let optionsToRender = [...this.solfegeOptions];

        if (this.isShuffled) {
            // Fisher-Yates Shuffle
            for (let i = optionsToRender.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [optionsToRender[i], optionsToRender[j]] = [optionsToRender[j], optionsToRender[i]];
            }
        }

        optionsToRender.forEach(name => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = name;
            btn.dataset.value = name;
            btn.addEventListener('click', () => {
                // Add click animation
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => btn.style.transform = '', 100);

                if (this.onOptionSelected) {
                    this.onOptionSelected(name);
                }
            });
            this.optionsContainer.appendChild(btn);
        });
    }

    // Relative Game Methods
    resetFeedback() {
        const buttons = this.optionsContainer.querySelectorAll('.option-btn');
        buttons.forEach(btn => {
            btn.classList.remove('correct', 'wrong');
            btn.disabled = false;
        });
        // Re-shuffle on new question if enabled
        if (this.isShuffled) {
            this.renderOptions();
        }
    }

    showSuccess(selectedName) {
        const buttons = this.optionsContainer.querySelectorAll('.option-btn');
        buttons.forEach(btn => {
            if (btn.dataset.value === selectedName) {
                btn.classList.add('correct');
            }
        });
    }

    showError(selectedName, correctName) {
        const buttons = this.optionsContainer.querySelectorAll('.option-btn');
        buttons.forEach(btn => {
            if (btn.dataset.value === selectedName) {
                btn.classList.add('wrong');
            }
            if (correctName && btn.dataset.value === correctName) {
                btn.classList.add('correct');
            }
        });
    }



    // Ordinance Game Methods
    renderSequence(totalLength, currentItems, direction) {
        this.ordinanceContainer.innerHTML = '';

        if (direction === 'Descending') {
            this.ordinanceContainer.classList.add('rtl');
        } else {
            this.ordinanceContainer.classList.remove('rtl');
        }

        for (let i = 0; i < totalLength; i++) {
            const slot = document.createElement('div');
            slot.className = 'sequence-slot';
            if (i < currentItems.length) {
                slot.textContent = currentItems[i];
                slot.classList.add('filled');
            } else if (i === currentItems.length) {
                slot.classList.add('active'); // Current target
            }
            this.ordinanceContainer.appendChild(slot);
        }
    }

    showSuccessEffect() {
        this.ordinanceContainer.classList.add('success-pulse');
        setTimeout(() => this.ordinanceContainer.classList.remove('success-pulse'), 500);
    }

    showErrorEffect() {
        this.ordinanceContainer.classList.add('shake');
        setTimeout(() => this.ordinanceContainer.classList.remove('shake'), 500);
    }


    showStats() {
        this.mainMenu.style.display = 'none';
        this.gameArea.style.display = 'none';
        this.statsContainer.style.display = 'block';
        document.getElementById('btn-back').style.display = 'block';

        this.renderStatsContent('relative', 'stats-relative-content');
        this.renderStatsContent('ordinance', 'stats-ordinance-content');
    }

    renderStatsContent(mode, containerId) {
        const stats = performanceTracker.getStats(mode);
        const container = document.getElementById(containerId);

        const t = translations[this.currentLang];

        container.innerHTML = `
            <div class="stat-row">
                <span>${t.total_answered || 'Total:'}</span>
                <strong>${stats.total}</strong>
            </div>
            <div class="stat-row">
                <span>${t.accuracy || 'Accuracy:'}</span>
                <strong>${stats.percentage}%</strong>
            </div>
            <div class="stat-row">
                <span>${t.median_time || 'Median Time:'}</span>
                <strong>${(stats.medianTime / 1000).toFixed(1)}${t.seconds_suffix || 's'}</strong>
            </div>
            <div class="stat-row">
                <span>${t.fastest_time || 'Fastest Time:'}</span>
                <strong>${(stats.fastestTime / 1000).toFixed(1)}${t.seconds_suffix || 's'}</strong>
            </div>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${stats.percentage}%"></div>
            </div>

            <div class="history-section">
                <h3>${t.daily_accuracy || 'Daily Accuracy'}</h3>
                <div class="chart-container" id="chart-acc-${mode}">
                    ${this.renderChart(performanceTracker.getDailyStats(mode), 'percent')}
                </div>
                
                <h3 style="margin-top: 1.5rem;">${t.daily_time || 'Daily Median Time'}</h3>
                <div class="chart-container" id="chart-time-${mode}">
                    ${this.renderChart(performanceTracker.getDailyStats(mode), 'time')}
                </div>
            </div>
        `;
    }

    renderChart(dailyStats, type = 'percent') {
        if (!dailyStats || dailyStats.length === 0) {
            return `<div class="no-data">${translations[this.currentLang].no_data || 'No data'}</div>`;
        }

        const width = 300;
        const height = 200;
        const padding = { top: 10, right: 10, bottom: 20, left: 35 };

        // Scales
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Determine Y Scale based on type
        let maxY = 100;
        let yLabels = [0, 50, 100];
        let formatY = (val) => `${val}%`;
        let getValue = (stat) => stat.accuracy;

        if (type === 'time') {
            getValue = (stat) => stat.medianTime;
            const maxTime = Math.max(...dailyStats.map(s => s.medianTime));
            // Round up to nearest second or 500ms for nice scale
            maxY = Math.ceil(maxTime / 1000) * 1000;
            if (maxY < 1000) maxY = 1000; // Minimum 1s scale

            yLabels = [0, Math.round(maxY / 2), maxY];
            formatY = (val) => `${(val / 1000).toFixed(1)}s`;
        }

        const xScale = (index) => padding.left + (index / (dailyStats.length - 1 || 1)) * chartWidth;
        const yScale = (val) => padding.top + chartHeight - (val / maxY) * chartHeight;

        // Generate Path
        let pathD = `M ${xScale(0)} ${yScale(getValue(dailyStats[0]))}`;
        dailyStats.forEach((stat, i) => {
            pathD += ` L ${xScale(i)} ${yScale(getValue(stat))}`;
        });

        // Generate Points
        const points = dailyStats.map((stat, i) => {
            const val = getValue(stat);
            const label = type === 'percent' ? `${val}%` : `${(val / 1000).toFixed(1)}s`;
            return `<circle cx="${xScale(i)}" cy="${yScale(val)}" r="4" class="chart-point" data-value="${label}" />`;
        }).join('');

        // Generate X Labels (Dates)
        const xLabels = dailyStats.map((stat, i) => {
            if (i === 0 || i === dailyStats.length - 1) {
                const dateStr = new Date(stat.date).toLocaleDateString(this.currentLang, { month: 'short', day: 'numeric' });
                return `<text x="${xScale(i)}" y="${height - 5}" text-anchor="${i === 0 ? 'start' : 'end'}" class="chart-label">${dateStr}</text>`;
            }
            return '';
        }).join('');

        // Generate Y Labels
        const yLabelSvg = yLabels.map(val => {
            return `<text x="${padding.left - 5}" y="${yScale(val) + 3}" text-anchor="end" class="chart-label">${formatY(val)}</text>`;
        }).join('');

        // Grid Lines
        const gridLines = yLabels.map(val => {
            const y = yScale(val);
            return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" class="chart-grid" />`;
        }).join('');

        return `
            <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
                <!-- Grid Lines -->
                ${gridLines}
                
                <!-- Path -->
                <path d="${pathD}" class="chart-line" fill="none" />
                
                <!-- Points -->
                ${points}
                
                <!-- Labels -->
                ${xLabels}
                ${yLabelSvg}
            </svg>
        `;
    }
}
