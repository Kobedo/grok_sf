import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { SupplementForm, PreviewPanel, SavedPanels } from '@';

const HomeContainer = styled.div`
  display: flex;
  gap: 20px;
  padding: 20px;
`;

interface PanelData {
  sku: string;
  productName: string;
  servingSize: string;
  servings: string;
}

interface Ingredient {
  nutrient: string;
  amount: string;
  unit: string;
  percent?: string;
}

function Home() {
  const [dvIngredients, setDvIngredients] = useState<Ingredient[]>([]);
  const [nonDvIngredients, setNonDvIngredients] = useState<Ingredient[]>([]);
  const [currentPanelId, setCurrentPanelId] = useState<number | null>(null);
  const [allPanels, setAllPanels] = useState<any[]>([]);
  const [panelData, setPanelData] = useState<PanelData>({
    sku: '',
    productName: '',
    servingSize: '',
    servings: '',
  });

  useEffect(() => {
    fetchPanels();
  }, []);

  const fetchPanels = async () => {
    try {
      const response = await fetch('/get-panels');
      const panels = await response.json();
      setAllPanels(panels);
    } catch (error) {
      console.error('Error fetching panels:', error);
    }
  };

  return (
    <HomeContainer>
      <SupplementForm
        dvIngredients={dvIngredients}
        setDvIngredients={setDvIngredients}
        nonDvIngredients={nonDvIngredients}
        setNonDvIngredients={setNonDvIngredients}
        panelData={panelData}
        setPanelData={setPanelData}
        fetchPanels={fetchPanels}
      />
      <div>
        <PreviewPanel
          dvIngredients={dvIngredients}
          nonDvIngredients={nonDvIngredients}
          panelData={panelData}
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
      </div>
    </HomeContainer>
  );
}

export default Home;