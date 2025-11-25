import { StaffRenderer } from './src/renderer.js';
import { RelativeGame } from './src/relative.js';
import { OrdinanceGame } from './src/ordinance.js';
import { UI } from './src/ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const renderer = new StaffRenderer('staff-container');
    const ui = new UI();

    // Initialize Games
    const relativeGame = new RelativeGame(renderer, ui);
    const ordinanceGame = new OrdinanceGame(ui);

    // Navigation Logic
    ui.bindModeSelect((mode) => {
        if (mode === 'relative') {
            relativeGame.init();
        } else if (mode === 'ordinance') {
            ordinanceGame.init();
        }
    });

    ui.bindBackToMenu(() => {
        // Optional: Cleanup if needed
        // For now, simple view switching is enough
    });

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
});
