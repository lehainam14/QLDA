import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';

// Import design tokens and original CSS
import './assets/css/tokens.css';
import './assets/css/base.css';
import './assets/css/components.css';
import './assets/css/pages/home.css';
import './assets/css/pages/job-detail.css';
import './assets/css/pages/auth.css';
import './assets/css/pages/student.css';
import './assets/css/pages/employer.css';
import './assets/css/pages/admin.css';
import './styles/custom.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
