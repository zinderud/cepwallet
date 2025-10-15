import React from 'react';
import { App } from './App';

const root = document.getElementById('root');
if (root) {
  const reactRoot = (window as any).ReactDOM?.createRoot || 
    function(el: any) { return { render: (component: any) => { el.innerHTML = component; } }; };
  
  const rootElement = (window as any).ReactDOM?.createRoot?.(root) || 
    (function() {
      const container = root as any;
      return {
        render: (component: React.ReactElement) => {
          try {
            require('react-dom/client').createRoot(root).render(component);
          } catch (e) {
            console.error('React rendering error:', e);
          }
        }
      };
    })();

  try {
    require('react-dom/client').createRoot(root).render(<App />);
  } catch (e) {
    console.error('Failed to render App:', e);
    root.innerHTML = '<h1>Error loading application</h1>';
  }
}
