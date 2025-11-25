import { performanceTracker } from './performance.js';

export class RelativeGame {
    constructor(renderer, ui) {
        this.renderer = renderer;
        this.ui = ui;
        this.ui = ui;
        this.currentQuestion = null;

        this.solfegeSequence = ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
    }

    init() {
        this.ui.bindOptionButtons((solfegeName) => this.checkAnswer(solfegeName));
        this.nextQuestion();
    }

    nextQuestion() {
        // 1. Pick Reference Note
        // Random Solfège Name
        const refIndex = Math.floor(Math.random() * this.solfegeSequence.length);
        const refName = this.solfegeSequence[refIndex];

        // Random Position on Staff (keep it somewhat central)
        // Step 0 = Bottom Line. Step 8 = Top Line.
        // Let's range from -2 to 10.
        const refStep = Math.floor(Math.random() * 13) - 2;

        // 2. Pick Target Note
        // Random interval distance (-4 to +4 steps, excluding 0)
        let interval = 0;
        while (interval === 0) {
            interval = Math.floor(Math.random() * 9) - 4;
        }

        const targetStep = refStep + interval;

        // Calculate Target Name
        // We need to wrap around the solfege array
        let targetIndex = (refIndex + interval) % 7;
        if (targetIndex < 0) targetIndex += 7;

        const targetName = this.solfegeSequence[targetIndex];

        this.currentQuestion = {
            refName,
            refStep,
            targetName,
            targetStep,
            answered: false
        };

        this.ui.resetFeedback();
        this.ui.setInstruction('instruction_relative', { ref: refName });

        this.renderer.drawNotes([
            { stepIndex: refStep, label: refName, color: 'var(--color-text)' },
            { stepIndex: targetStep, label: '?', color: 'var(--color-primary)' }
        ]);

        this.startTime = Date.now();
    }

    checkAnswer(selectedSolfege) {
        if (this.currentQuestion.answered) return;

        const isCorrect = selectedSolfege === this.currentQuestion.targetName;
        this.currentQuestion.answered = true;
        const timeMs = Date.now() - this.startTime;

        if (isCorrect) {
            performanceTracker.recordResult('relative', true, timeMs);
            this.ui.showSuccess(selectedSolfege);
            // Reveal answer
            this.renderer.drawNotes([
                { stepIndex: this.currentQuestion.refStep, label: this.currentQuestion.refName, color: 'var(--color-text)' },
                { stepIndex: this.currentQuestion.targetStep, label: this.currentQuestion.targetName, color: 'var(--color-success)' }
            ]);
        } else {
            performanceTracker.recordResult('relative', false, timeMs);
            this.ui.showError(selectedSolfege, this.currentQuestion.targetName);
            // Reveal answer
            this.renderer.drawNotes([
                { stepIndex: this.currentQuestion.refStep, label: this.currentQuestion.refName, color: 'var(--color-text)' },
                { stepIndex: this.currentQuestion.targetStep, label: this.currentQuestion.targetName, color: 'var(--color-error)' }
            ]);
        }



        // Auto next after delay
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }
}
