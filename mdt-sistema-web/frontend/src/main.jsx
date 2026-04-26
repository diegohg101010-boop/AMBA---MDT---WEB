import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './animations.css';
import './backgrounds.css';
import './emoji-animations.css';
import App from './App.jsx';
import { soundSystem } from './utils/soundSystem';

// Agregar event listeners globales para sonidos
window.addEventListener('load', () => {
  // Sonidos en clicks
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, .btn, .nav-item, .quick-action-btn, .tab-btn, .btn-icon');
    if (btn && !btn.disabled) {
      if (btn.classList.contains('btn-primary') || btn.classList.contains('btn-aplicar')) {
        soundSystem.clickPrimary();
      } else if (btn.classList.contains('btn-danger') || btn.classList.contains('btn-limpiar')) {
        soundSystem.clickDanger();
      } else if (btn.classList.contains('btn-close')) {
        soundSystem.closeModal();
      } else if (btn.classList.contains('nav-item')) {
        soundSystem.clickPrimary();
      } else {
        soundSystem.click();
      }
    }
  }, true);

  // Sonidos en selects
  document.addEventListener('change', (e) => {
    if (e.target.tagName === 'SELECT') {
      soundSystem.click();
    }
  });

  // Sonidos en inputs (throttled)
  let lastTypingTime = 0;
  document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      const now = Date.now();
      if (now - lastTypingTime > 100) {
        soundSystem.typing();
        lastTypingTime = now;
      }
    }
  });
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Exportar soundSystem para uso en componentes
window.soundSystem = soundSystem;
