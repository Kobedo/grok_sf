import styled from 'styled-components';
import { useState, useEffect } from 'react';

const IngredientsContainer = styled.div`
  padding: 20px;
`;

const Input = styled.input`
  margin-right: 10px;
`;

const Button = styled.button`
  margin: 0 5px;
`;

function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newRdi, setNewRdi] = useState('');

  useEffect(() => {
    console.log('Fetching /api/get-ingredients...');
    fetch('/api/get-ingredients')
      .then(res => res.text())
      .then(text => {
        console.log('Raw response from /api/get-ingredients:', text);
        return JSON.parse(text);
      })
      .then(data => {
        console.log('Parsed data:', data);
        setIngredients(data);
      })
      .catch(err => console.error('Fetch error:', err));
  }, []);

  const addIngredient = async () => {
    if (newName.trim()) {
      const res = await fetch('/api/add-ingredient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          unit: newUnit || 'mg',
          rdi: newRdi ? Number(newRdi) : null
        }),
      });
      if (res.ok) {
        const updated = await fetch('/api/get-ingredients').then(r => r.json());
        setIngredients(updated);
        setNewName('');
        setNewUnit('');
        setNewRdi('');
      }
    }
  };

  return (
    <IngredientsContainer>
      <h1>Manage Ingredients</h1>
      <div>
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Name"
        />
        <Input
          value={newUnit}
          onChange={(e) => setNewUnit(e.target.value)}
          placeholder="Unit"
        />
        <Input
          value={newRdi}
          onChange={(e) => setNewRdi(e.target.value)}
          placeholder="RDI (optional)"
          type="number"
        />
        <Button onClick={addIngredient}>Add</Button>
      </div>
      <ul>
        {ingredients.map((ing) => (
          <li key={ing.id}>{`${ing.name} (${ing.unit}, RDI: ${ing.rdi ?? 'N/A'})`}</li>
        ))}
      </ul>
    </IngredientsContainer>
  );
}

export default Ingredients;