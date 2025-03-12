import { useState, useEffect } from 'react';
import styled from 'styled-components';

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 300px;
`;

const Input = styled.input`
  padding: 5px;
  width: 100%;
`;

const Select = styled.select`
  padding: 5px;
  width: 100%;
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

const List = styled.ul`
  list-style: none;
  padding: 0;
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

interface Props {
  dvIngredients: Ingredient[];
  setDvIngredients: (ingredients: Ingredient[]) => void;
  nonDvIngredients: Ingredient[];
  setNonDvIngredients: (ingredients: Ingredient[]) => void;
  panelData: PanelData;
  setPanelData: (data: PanelData) => void;
  fetchPanels: () => Promise<void>;
}

function SupplementForm({
  dvIngredients,
  setDvIngredients,
  nonDvIngredients,
  setNonDvIngredients,
  panelData,
  setPanelData,
  fetchPanels,
}: Props) {
  const [dvState, setDvState] = useState({
    nutrient: '',
    amount: '',
    percent: '',
    autoCalculate: true,
    calculatedDV: '',
  });
  const [nonDvState, setNonDvState] = useState({
    nutrient: '',
    amount: '',
    unit: '',
  });
  const [availableIngredients, setAvailableIngredients] = useState<
    { name: string; unit: string; rdi: number | null }[]
  >([]);

  useEffect(() => {
    fetch('/api/get-ingredients')
      .then(res => res.json())
      .then(data => setAvailableIngredients(data))
      .catch(err => console.error('Fetch ingredients error:', err));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPanelData({ ...panelData, [e.target.id]: e.target.value });
  };

  const calculateDV = () => {
    const { nutrient, amount, autoCalculate } = dvState;
    if (!nutrient || !amount || !autoCalculate) {
      setDvState({ ...dvState, calculatedDV: '' });
      return;
    }

    const ingredient = availableIngredients.find(i => i.name === nutrient);
    if (!ingredient || ingredient.rdi === null) {
      setDvState({ ...dvState, calculatedDV: '' });
      return;
    }

    const amountNum = parseFloat(amount.match(/(\d*\.?\d+)/)?.[0] || '0');
    const percentDV = Math.round((amountNum / ingredient.rdi) * 100);
    setDvState({ ...dvState, calculatedDV: `${percentDV}%` });
  };

  const addDVIngredient = () => {
    const { nutrient, amount, percent, autoCalculate, calculatedDV } = dvState;
    if (!nutrient || !amount) return;

    const ingredient = availableIngredients.find(i => i.name === nutrient);
    const unit = ingredient ? ingredient.unit : '';

    const finalPercent = autoCalculate && !percent ? calculatedDV || '0%' : percent;
    setDvIngredients([...dvIngredients, { nutrient, amount, unit, percent: finalPercent }]);
    setDvState({ nutrient: '', amount: '', percent: '', autoCalculate: true, calculatedDV: '' });
  };

  const addNonDVIngredient = () => {
    const { nutrient, amount, unit } = nonDvState;
    if (nutrient && amount && unit) {
      setNonDvIngredients([...nonDvIngredients, { nutrient, amount, unit }]);
      setNonDvState({ nutrient: '', amount: '', unit: '' });
    }
  };

  const savePanel = async () => {
    const payload = {
      id: null,
      ...panelData,
      dvIngredients,
      nonDvIngredients,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/save-panel', { // Updated to /api/
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await response.json();
      await fetchPanels();
    } catch (error) {
      console.error('Error saving panel:', error);
    }
  };

  return (
    <FormContainer>
      <h2>Create/Edit Supplement Facts</h2>
      <Input id="sku" placeholder="e.g., EB123" value={panelData.sku} onChange={handleInputChange} />
      <Input id="productName" placeholder="e.g., Energy Boost" value={panelData.productName} onChange={handleInputChange} />
      <Input id="servingSize" value={panelData.servingSize} onChange={handleInputChange} />
      <Input id="servings" value={panelData.servings} onChange={handleInputChange} />

      <h3>Daily Value Ingredients</h3>
      <Select
        value={dvState.nutrient}
        onChange={(e) => setDvState({ ...dvState, nutrient: e.target.value })}
      >
        <option value="">Select a DV Ingredient</option>
        {availableIngredients.map((i) => (
          <option key={i.name} value={i.name}>{`${i.name} (${i.unit})`}</option>
        ))}
      </Select>
      <Input
        placeholder="e.g., 90"
        value={dvState.amount}
        onChange={(e) => setDvState({ ...dvState, amount: e.target.value })}
        onInput={calculateDV}
      />
      <label>
        <input
          type="checkbox"
          checked={dvState.autoCalculate}
          onChange={(e) => setDvState({ ...dvState, autoCalculate: e.target.checked })}
        /> Auto-calculate % DV
      </label>
      <Input value={dvState.calculatedDV} readOnly />
      <Input
        placeholder="e.g., 100%"
        value={dvState.percent}
        onChange={(e) => setDvState({ ...dvState, percent: e.target.value })}
      />
      <Button onClick={addDVIngredient}>Add DV Ingredient</Button>
      <List>
        {dvIngredients.map((item, idx) => (
          <li key={idx}>{`${item.nutrient}: ${item.amount} ${item.unit}, ${item.percent}`}</li>
        ))}
      </List>

      <h3>Non-Daily Value Ingredients</h3>
      <Input
        placeholder="e.g., Ginseng"
        value={nonDvState.nutrient}
        onChange={(e) => setNonDvState({ ...nonDvState, nutrient: e.target.value })}
      />
      <Input
        placeholder="e.g., 50"
        value={nonDvState.amount}
        onChange={(e) => setNonDvState({ ...nonDvState, amount: e.target.value })}
      />
      <Input
        placeholder="e.g., mg"
        value={nonDvState.unit}
        onChange={(e) => setNonDvState({ ...nonDvState, unit: e.target.value })}
      />
      <Button onClick={addNonDVIngredient}>Add Non-DV Ingredient</Button>
      <List>
        {nonDvIngredients.map((item, idx) => (
          <li key={idx}>{`${item.nutrient}: ${item.amount} ${item.unit}`}</li>
        ))}
      </List>

      <Button onClick={savePanel}>Save Panel</Button>
    </FormContainer>
  );
}

export default SupplementForm;
