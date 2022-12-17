import React from 'react';
import ReactDOM from 'react-dom/client';

import Matrix from './matrix';

import './index.css'

const root = ReactDOM.createRoot(document.getElementById('app-root'));

root.render(
  <React.StrictMode>
    <Matrix />
  </React.StrictMode>
);