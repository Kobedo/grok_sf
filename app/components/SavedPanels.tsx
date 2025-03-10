import { useState } from 'react';
import styled from 'styled-components';

const SavedContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SearchInput = styled.input`
  padding: 5px;
  max-width: 250px;
`;

const Select = styled.select`
  max-width: 250px;
`;

const Button = styled.button`
  padding: 8px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

interface Ingredient {
  nutrient: string;
  amount: string;
  unit: string;
  percent?: string;
}

interface PanelData {
  sku: string;
  productName: string;
  servingSize: string;
  servings: string;
}

interface Panel {
  id: number;
  sku: string;
  productName: string;
  servingSize: string;
  servings: string;
  dvIngredients: string;
  nonDvIngredients: string;
  timestamp: string;
}

interface Props {
  allPanels: Panel[];
  setAllPanels: (panels: Panel[]) => void;
  setDvIngredients: (ingredients: Ingredient[]) => void;
  setNonDvIngredients: (ingredients: Ingredient[]) => void;
  setCurrentPanelId: (id: number | null) => void;
  setPanelData: (data: PanelData) => void;
  fetchPanels: () => Promise<void>;
}

function SavedPanels({
  allPanels,
  setAllPanels,
  setDvIngredients,
  setNonDvIngredients,
  setCurrentPanelId,
  setPanelData,
  fetchPanels,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  const filterPanels = () => {
    const searchLower = searchTerm.toLowerCase();
    const filtered = allPanels
      .map(panel => {
        const skuLower = panel.sku.toLowerCase();
        const nameLower = panel.productName.toLowerCase();
        let score = 0;
        if (skuLower === searchLower || nameLower === searchLower) score = 3;
        else if (skuLower.startsWith(searchLower) || nameLower.startsWith(searchLower)) score = 2;
        else if (skuLower.includes(searchLower) || nameLower.includes(searchLower)) score = 1;
        return { panel, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.panel.timestamp.localeCompare(b.panel.timestamp))
      .map(item => item.panel);
    setAllPanels(filtered.length > 0 ? filtered : allPanels);
  };

  const loadPanel = async (panelId: string) => {
    if (!panelId) {
      setPanelData({ sku: '', productName: '', servingSize: '', servings: '' });
      setDvIngredients([]);
      setNonDvIngredients([]);
      setCurrentPanelId(null);
      return;
    }

    try {
      const response = await fetch(`/get-panels?id=${panelId}`);
      const [panel] = await response.json();
      setPanelData({
        sku: panel.sku,
        productName: panel.productName,
        servingSize: panel.servingSize,
        servings: panel.servings,
      });
      setDvIngredients(JSON.parse(panel.dvIngredients));
      setNonDvIngredients(JSON.parse(panel.nonDvIngredients));
      setCurrentPanelId(panel.id);
    } catch (error) {
      console.error('Error loading panel:', error);
    }
  };

  return (
    <SavedContainer>
      <h2>Saved Panels</h2>
      <SearchInput
        placeholder="Search by SKU or Product Name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onInput={filterPanels}
      />
      <Select onChange={(e) => loadPanel(e.target.value)}>
        <option value="">Select a saved panel</option>
        {allPanels.map(panel => (
          <option key={panel.id} value={panel.id}>
            {`${panel.sku} - ${panel.productName} - ${new Date(panel.timestamp).toLocaleString()}`}
          </option>
        ))}
      </Select>
      <Button onClick={fetchPanels}>Refresh Saved Panels</Button>
    </SavedContainer>
  );
}

export default SavedPanels;