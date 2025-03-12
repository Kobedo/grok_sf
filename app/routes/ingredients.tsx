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

const ListItem = styled.li`
  display: flex;
  align-items: center;
  margin: 5px 0;
`;

function Ingredients() {
  const [ingredients, setIngredients] = useState([]);
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newRdi, setNewRdi] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editRdi, setEditRdi] = useState('');

  useEffect(() => {
    fetch('/api/get-ingredients')
      .then(res => res.json())
      .then(data => setIngredients(data))
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

  const startEdit = (ing) => {
    setEditId(ing.id);
    setEditName(ing.name);
    setEditUnit(ing.unit);
    setEditRdi(ing.rdi ? String(ing.rdi) : '');
  };

  const saveEdit = async () => {
    if (editId && editName.trim()) {
      const res = await fetch(`/api/update-ingredient/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          unit: editUnit || 'mg',
          rdi: editRdi ? Number(editRdi) : null
        }),
      });
      if (res.ok) {
        const updated = await fetch('/api/get-ingredients').then(r => r.json());
        setIngredients(updated);
        setEditId(null);
        setEditName('');
        setEditUnit('');
        setEditRdi('');
      }
    }
  };

  const deleteIngredient = async (id) => {
    const res = await fetch(`/api/delete-ingredient/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setIngredients(ingredients.filter(ing => ing.id !== id));
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
          <ListItem key={ing.id}>
            {editId === ing.id ? (
              <>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <Input
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                />
                <Input
                  value={editRdi}
                  onChange={(e) => setEditRdi(e.target.value)}
                  type="number"
                />
                <Button onClick={saveEdit}>Save</Button>
                <Button onClick={() => setEditId(null)}>Cancel</Button>
              </>
            ) : (
              <>
                {`${ing.name} (${ing.unit}, RDI: ${ing.rdi ?? 'N/A'})`}
                <Button onClick={() => startEdit(ing)}>Edit</Button>
                <Button onClick={() => deleteIngredient(ing.id)}>Delete</Button>
              </>
            )}
          </ListItem>
        ))}
      </ul>
    </IngredientsContainer>
  );
}

export default Ingredients;
