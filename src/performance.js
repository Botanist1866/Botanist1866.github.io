export class PerformanceTracker {
    constructor() {
        this.storageKey = 'solfege_performance_v1';
        this.history = this.loadHistory();
    }

    loadHistory() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }

    saveHistory() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    }

    recordResult(mode, isCorrect, timeMs = 0) {
        const entry = {
            timestamp: Date.now(),
            mode: mode,
            correct: isCorrect,
            timeMs: timeMs
        };
        this.history.push(entry);
        this.saveHistory();
    }

    getStats(mode) {
        const modeHistory = this.history.filter(h => h.mode === mode);
        const total = modeHistory.length;
        const correct = modeHistory.filter(h => h.correct).length;

        // Calculate Time Stats (only for correct answers)
        const correctTimes = modeHistory
            .filter(h => h.correct && h.timeMs > 0)
            .map(h => h.timeMs)
            .sort((a, b) => a - b);

        let medianTime = 0;
        let fastestTime = 0;

        if (correctTimes.length > 0) {
            fastestTime = correctTimes[0];
            const mid = Math.floor(correctTimes.length / 2);
            medianTime = correctTimes.length % 2 !== 0
                ? correctTimes[mid]
                : (correctTimes[mid - 1] + correctTimes[mid]) / 2;
        }

        return {
            total,
            correct,
            percentage: total === 0 ? 0 : Math.round((correct / total) * 100),
            medianTime: Math.round(medianTime),
            fastestTime: Math.round(fastestTime)
        };
    }

    getDailyStats(mode, days = 7) {
        const modeHistory = this.history.filter(h => h.mode === mode);
        const dailyMap = new Map();

        // Group by date
        modeHistory.forEach(entry => {
            const date = new Date(entry.timestamp).toISOString().split('T')[0];
            if (!dailyMap.has(date)) {
                dailyMap.set(date, { total: 0, correct: 0, times: [] });
            }
            const dayStats = dailyMap.get(date);
            dayStats.total++;
            if (entry.correct) {
                dayStats.correct++;
                if (entry.timeMs > 0) dayStats.times.push(entry.timeMs);
            }
        });

        // Convert to array and sort
        const sortedDates = Array.from(dailyMap.keys()).sort();
        const recentDates = sortedDates.slice(-days);

        return recentDates.map(date => {
            const stats = dailyMap.get(date);

            // Calculate median time for the day
            let medianTime = 0;
            stats.times.sort((a, b) => a - b);
            if (stats.times.length > 0) {
                const mid = Math.floor(stats.times.length / 2);
                medianTime = stats.times.length % 2 !== 0
                    ? stats.times[mid]
                    : (stats.times[mid - 1] + stats.times[mid]) / 2;
            }

            return {
                date,
                accuracy: Math.round((stats.correct / stats.total) * 100),
                medianTime: Math.round(medianTime),
                count: stats.total
            };
        });
    }

    getRecentHistory(mode, limit = 50) {
        return this.history
            .filter(h => h.mode === mode)
            .slice(-limit);
    }

    resetStats() {
        this.history = [];
        this.saveHistory();
    }
}

export const performanceTracker = new PerformanceTracker();
