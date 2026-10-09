import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { routeByPath } from './data/routes';
import { loadPage } from './pages/registry';
import { initialPath } from './router';
import './index.css';
import './components/backgrounds/backgrounds.css';

const render = () =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

// A direct visit to an inner page loads that page's code before the first render.
const initial = routeByPath(initialPath())?.key;
if (initial && initial !== 'home') loadPage(initial).then(render, render);
else render();
