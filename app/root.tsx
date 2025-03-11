import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Home } from '@';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);