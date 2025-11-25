import { performanceTracker } from './performance.js';

export class OrdinanceGame {
    constructor(ui) {
        this.ui = ui;
        this.ui = ui;
        this.currentSequence = null; // { target: [], current: [], direction: 'asc'|'desc' }
        this.solfegeSequence = ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
    }

    init() {
        this.ui.bindOptionButtons((solfegeName) => this.handleInput(solfegeName));
        this.nextQuestion();
    }

    nextQuestion() {
        // 1. Random Start Note
        const startIndex = Math.floor(Math.random() * this.solfegeSequence.length);
        const startName = this.solfegeSequence[startIndex];

        // 2. Random Direction
        const isAscending = Math.random() > 0.5;
        const direction = isAscending ? 'Ascending' : 'Descending';

        // 3. Random Length (2 to 5 notes total, including start)
        const length = Math.floor(Math.random() * 4) + 2;

        // 4. Generate Target Sequence
        const target = [];
        for (let i = 0; i < length; i++) {
            let index;
            if (isAscending) {
                index = (startIndex + i) % 7;
            } else {
                index = (startIndex - i) % 7;
                if (index < 0) index += 7;
            }
            target.push(this.solfegeSequence[index]);
        }

        this.currentSequence = {
            target, // Full sequence e.g. ['Do', 'Ré', 'Mi']
            current: [startName], // Start with first note filled e.g. ['Do']
            direction
        };

        this.ui.resetFeedback();
        const instructionKey = isAscending ? 'instruction_ordinance_asc' : 'instruction_ordinance_desc';
        this.ui.setInstruction(instructionKey);
        this.ui.renderSequence(this.currentSequence.target.length, this.currentSequence.current, this.currentSequence.direction);

        this.startTime = Date.now();
    }

    handleInput(inputName) {
        if (!this.currentSequence) return;

        const nextIndex = this.currentSequence.current.length;
        if (nextIndex >= this.currentSequence.target.length) return; // Already full

        const expectedName = this.currentSequence.target[nextIndex];

        if (inputName === expectedName) {
            // Correct
            this.currentSequence.current.push(inputName);
            this.ui.renderSequence(this.currentSequence.target.length, this.currentSequence.current, this.currentSequence.direction);

            // Check if complete
            if (this.currentSequence.current.length === this.currentSequence.target.length) {
                const timeMs = Date.now() - this.startTime;
                performanceTracker.recordResult('ordinance', true, timeMs);
                this.ui.showSuccessEffect();
                setTimeout(() => this.nextQuestion(), 1000);
            }
        } else {
            // Wrong
            performanceTracker.recordResult('ordinance', false);
            this.ui.showErrorEffect();
            // Optional: Reset sequence or just shake? Let's just shake and let them retry.
        }
    }
}
