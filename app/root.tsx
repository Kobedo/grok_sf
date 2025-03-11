import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Home } from '@';
import { BrowserRouter, Route, Routes, NavLink } from 'react-router-dom';
import styled from 'styled-components';

const Nav = styled.nav`
  display: flex;
  gap: 20px;
  padding: 10px;
  background-color: #f0f0f0;
`;

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <BrowserRouter>
      <Nav>
        <NavLink to="/">Home</NavLink>
      </Nav>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);