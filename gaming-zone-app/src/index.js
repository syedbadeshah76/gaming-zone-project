import React from 'react';
import ReactDOM from 'react-dom/client'; // For React 18+
import './index.css'; // Your global CSS
import App from './App';
import { BrowserRouter } from 'react-router-dom'; // <--- Import BrowserRouter here

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* <--- Wrap App with BrowserRouter here */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);