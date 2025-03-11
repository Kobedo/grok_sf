import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Home, Generator, Saved, Ingredients } from '@';
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
        <NavLink to="/generator">Generator</NavLink>
        <NavLink to="/saved">Saved Panels</NavLink>
        <NavLink to="/ingredients">Ingredients</NavLink>
      </Nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generator" element={<Generator />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/ingredients" element={<Ingredients />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);