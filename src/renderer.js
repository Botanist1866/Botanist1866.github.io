export class StaffRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.ns = "http://www.w3.org/2000/svg";
        this.width = 300;
        this.height = 200;
        this.lineSpacing = 20;
        this.topLineY = 60; // Y position of the top line of the staff

        this.initSVG();
    }

    initSVG() {
        this.svg = document.createElementNS(this.ns, "svg");
        this.svg.setAttribute("width", "100%");
        this.svg.setAttribute("height", "100%");
        this.svg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);
        this.container.appendChild(this.svg);
    }

    clear() {
        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
        }
    }

    drawStaff() {
        // Draw 5 lines
        for (let i = 0; i < 5; i++) {
            const y = this.topLineY + (i * this.lineSpacing);
            this.drawLine(20, y, this.width - 20, y, 2, "var(--color-text-muted)");
        }
        // No Clef
    }

    /**
     * Draw multiple notes.
     * @param {Array} notes - Array of objects { stepIndex, label, color }
     * stepIndex: 0 = Bottom Line (E4 position in Treble, but relative here).
     *            1 = Bottom Space
     *            2 = 2nd Line
     *            etc.
     */
    drawNotes(notes) {
        this.clear();
        this.drawStaff();

        // Calculate X spacing
        const startX = 100;
        const spacingX = 80;

        notes.forEach((note, index) => {
            const x = startX + (index * spacingX);
            this.drawSingleNote(x, note.stepIndex, note.label, note.color);
        });
    }

    drawSingleNote(x, stepIndex, label, color = "var(--color-text)") {
        // Map stepIndex to Y
        // Let's define stepIndex 0 as the Bottom Line.
        // Bottom Line Y = this.topLineY + 4 * this.lineSpacing
        const bottomLineY = this.topLineY + 4 * this.lineSpacing;
        const stepHeight = this.lineSpacing / 2;

        const y = bottomLineY - (stepIndex * stepHeight);

        // Ledger Lines
        // If stepIndex < -1 (below bottom line space), we need ledgers.
        // If stepIndex > 9 (above top line space), we need ledgers.
        // Top line is stepIndex 8.

        // Ledger below
        // -2 is line below. -4 is line below that.
        for (let s = -2; s >= stepIndex; s -= 2) {
            const ly = bottomLineY - (s * stepHeight);
            this.drawLine(x - 20, ly, x + 20, ly, 2, color);
        }

        // Ledger above
        // 10 is line above. 12 is line above that.
        for (let s = 10; s <= stepIndex; s += 2) {
            const ly = bottomLineY - (s * stepHeight);
            this.drawLine(x - 20, ly, x + 20, ly, 2, color);
        }

        // Note Head
        const noteHead = document.createElementNS(this.ns, "ellipse");
        noteHead.setAttribute("cx", x);
        noteHead.setAttribute("cy", y);
        noteHead.setAttribute("rx", 10);
        noteHead.setAttribute("ry", 8);
        noteHead.setAttribute("fill", color);
        this.svg.appendChild(noteHead);

        // Stem
        // Up if below middle line (step 4), Down if above.
        const stemHeight = 55;
        const stemX = stepIndex < 4 ? x + 9 : x - 9;
        const stemY1 = y;
        const stemY2 = stepIndex < 4 ? y - stemHeight : y + stemHeight;

        this.drawLine(stemX, stemY1, stemX, stemY2, 2, color);

        // Label
        if (label) {
            const text = document.createElementNS(this.ns, "text");
            text.setAttribute("x", x);
            text.setAttribute("y", bottomLineY + 50); // Below staff
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("fill", color);
            text.setAttribute("font-size", "18");
            text.setAttribute("font-weight", "bold");
            text.textContent = label;
            this.svg.appendChild(text);
        }
    }

    drawLine(x1, y1, x2, y2, width, color) {
        const line = document.createElementNS(this.ns, "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke-width", width);
        line.setAttribute("stroke", color);
        this.svg.appendChild(line);
    }
}
