import { useState, useEffect } from 'react';
import styled from 'styled-components';

const SavedContainer = styled.div`
  padding: 20px;
`;

function Saved() {
  const [panels, setPanels] = useState([]);

  useEffect(() => {
    fetch('/get-panels')
      .then(res => res.json())
      .then(data => setPanels(data))
      .catch(err => console.error('Error fetching panels:', err));
  }, []);

  return (
    <SavedContainer>
      <h1>Saved Panels</h1>
      <ul>
        {panels.map(panel => (
          <li key={panel.id}>{`${panel.sku} - ${panel.productName} - ${new Date(panel.timestamp).toLocaleString()}`}</li>
        ))}
      </ul>
    </SavedContainer>
  );
}

export default Saved;