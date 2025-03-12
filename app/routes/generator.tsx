import { useState, useEffect } from 'react';
import { SupplementForm, PreviewPanel, SavedPanels } from '@';
import styled from 'styled-components';

const GeneratorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
`;

function Generator() {
  const [panelData, setPanelData] = useState({ sku: '', productName: '', servingSize: '', servings: '' });
  const [dvIngredients, setDvIngredients] = useState([]);
  const [nonDvIngredients, setNonDvIngredients] = useState([]);
  const [currentPanelId, setCurrentPanelId] = useState(null);
  const [allPanels, setAllPanels] = useState([]);

  const fetchPanels = async () => {
    try {
      const response = await fetch('/api/get-panels'); // Fixed to /api/
      const panels = await response.json();
      setAllPanels(panels);
    } catch (error) {
      console.error('Error fetching panels:', error);
    }
  };

  useEffect(() => {
    fetchPanels();
  }, []);

  return (
    <GeneratorContainer>
      <SupplementForm
        panelData={panelData}
        setPanelData={setPanelData}
        dvIngredients={dvIngredients}
        setDvIngredients={setDvIngredients}
        nonDvIngredients={nonDvIngredients}
        setNonDvIngredients={setNonDvIngredients}
        currentPanelId={currentPanelId}
        fetchPanels={fetchPanels}
      />
      <PreviewPanel
        panelData={panelData}
        dvIngredients={dvIngredients}
        nonDvIngredients={nonDvIngredients}
      />
      <SavedPanels
        allPanels={allPanels}
        setAllPanels={setAllPanels}
        setDvIngredients={setDvIngredients}
        setNonDvIngredients={setNonDvIngredients}
        setCurrentPanelId={setCurrentPanelId}
        setPanelData={setPanelData}
        fetchPanels={fetchPanels}
      />
    </GeneratorContainer>
  );
}

export default Generator;