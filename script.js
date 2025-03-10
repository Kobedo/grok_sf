let dvIngredients = [];
let nonDVIngredients = [];
let currentPanelId = null;
let allPanels = [];

document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('dvIngredient');
  select.innerHTML = '<option value="">Select a DV Ingredient</option>';

  for (const category in fdaIngredients) {
    if (Array.isArray(fdaIngredients[category])) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = category;
      fdaIngredients[category].forEach(ingredient => {
        const option = document.createElement('option');
        option.value = ingredient.name;
        option.textContent = `${ingredient.name} (${ingredient.unit})`;
        optgroup.appendChild(option);
      });
      select.appendChild(optgroup);
    } else {
      for (const subcategory in fdaIngredients[category]) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = `${category} - ${subcategory}`;
        fdaIngredients[category][subcategory].forEach(ingredient => {
          const option = document.createElement('option');
          option.value = ingredient.name;
          option.textContent = `${ingredient.name} (${ingredient.unit})`;
          optgroup.appendChild(option);
        });
        select.appendChild(optgroup);
      }
    }
  }

  fetchPanels();
});

// ... (calculateDV, addDVIngredient, addNonDVIngredient, updateDVList, updateNonDVList, generatePanel unchanged)

function savePanel() {
  const sku = document.getElementById('sku').value || 'Not specified';
  const productName = document.getElementById('productName').value || 'Not specified';
  const servingSize = document.getElementById('servingSize').value || 'Not specified';
  const servings = document.getElementById('servings').value || 'Not specified';
  const panelData = {
    id: currentPanelId,
    sku,
    productName,
    servingSize,
    servings,
    dvIngredients,
    nonDVIngredients,
    timestamp: new Date().toISOString()
  };

  fetch('/save-panel', {  // Changed from http://localhost:3000/save-panel
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(panelData)
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('saveStatus').textContent = data.message;
    fetchPanels();
  })
  .catch(error => {
    document.getElementById('saveStatus').textContent = 'Error saving panel: ' + error.message;
  });
}

function fetchPanels() {
  fetch('/get-panels')  // Changed from http://localhost:3000/get-panels
    .then(response => response.json())
    .then(panels => {
      allPanels = panels;
      updatePanelDropdown(panels);
    })
    .catch(error => {
      document.getElementById('saveStatus').textContent = 'Error fetching panels: ' + error.message;
    });
}

function updatePanelDropdown(panels) {
  const select = document.getElementById('savedPanels');
  select.innerHTML = '<option value="">Select a saved panel</option>';
  panels.forEach(panel => {
    const option = document.createElement('option');
    option.value = panel.id;
    option.textContent = `${panel.sku} - ${panel.productName} - ${new Date(panel.timestamp).toLocaleString()}`;
    select.appendChild(option);
  });
  if (panels.length > 0) {
    select.selectedIndex = 1;
  } else {
    select.selectedIndex = 0;
  }
}

function filterPanels(searchTerm) {
  const searchLower = searchTerm.toLowerCase();
  const filteredPanels = allPanels
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
  updatePanelDropdown(filteredPanels);
}

function loadPanel(panelId) {
  if (!panelId) {
    document.getElementById('sku').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('servingSize').value = '';
    document.getElementById('servings').value = '';
    dvIngredients = [];
    nonDVIngredients = [];
    currentPanelId = null;
    updateDVList();
    updateNonDVList();
    generatePanel();
    return;
  }

  fetch(`/get-panels?id=${panelId}`)  // Changed from http://localhost:3000/get-panels?id=
    .then(response => response.json())
    .then(panels => {
      const panel = panels[0];
      document.getElementById('sku').value = panel.sku;
      document.getElementById('productName').value = panel.productName;
      document.getElementById('servingSize').value = panel.servingSize;
      document.getElementById('servings').value = panel.servings;
      dvIngredients = JSON.parse(panel.dvIngredients);
      nonDVIngredients = JSON.parse(panel.nonDVIngredients);
      currentPanelId = panel.id;
      updateDVList();
      updateNonDVList();
      generatePanel();
    })
    .catch(error => {
      document.getElementById('saveStatus').textContent = 'Error loading panel: ' + error.message;
    });
}