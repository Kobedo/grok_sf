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

function calculateDV() {
  const nutrient = document.getElementById('dvIngredient').value;
  const amountInput = document.getElementById('dvAmount').value;
  const autoCalculate = document.getElementById('autoCalculate').checked;
  const calculatedDVField = document.getElementById('calculatedDV');

  if (!nutrient || !amountInput || !autoCalculate) {
    calculatedDVField.value = '';
    return;
  }

  let rdi, unit;
  for (const category in fdaIngredients) {
    if (Array.isArray(fdaIngredients[category])) {
      const found = fdaIngredients[category].find(i => i.name === nutrient);
      if (found) { rdi = found.rdi; unit = found.unit; }
    } else {
      for (const subcategory in fdaIngredients[category]) {
        const found = fdaIngredients[category][subcategory].find(i => i.name === nutrient);
        if (found) { rdi = found.rdi; unit = found.unit; }
      }
    }
  }

  if (!rdi) return;

  const amountMatch = amountInput.match(/(\d*\.?\d+)/);
  const amount = amountMatch ? parseFloat(amountMatch[0]) : 0;
  const percentDV = Math.round((amount / rdi) * 100);
  calculatedDVField.value = `${percentDV}%`;
}

function addDVIngredient() {
  const nutrient = document.getElementById('dvIngredient').value;
  const amount = document.getElementById('dvAmount').value;
  const autoCalculate = document.getElementById('autoCalculate').checked;
  let percent = document.getElementById('dvPercent').value;

  if (nutrient && amount) {
    let unit;
    for (const category in fdaIngredients) {
      if (Array.isArray(fdaIngredients[category])) {
        const found = fdaIngredients[category].find(i => i.name === nutrient);
        if (found) unit = found.unit;
      } else {
        for (const subcategory in fdaIngredients[category]) {
          const found = fdaIngredients[category][subcategory].find(i => i.name === nutrient);
          if (found) unit = found.unit;
        }
      }
    }

    if (autoCalculate && !percent) {
      const calculatedDV = document.getElementById('calculatedDV').value;
      percent = calculatedDV || '0%';
    }
    dvIngredients.push({ nutrient, amount, unit, percent });
    updateDVList();
    document.getElementById('dvIngredient').value = '';
    document.getElementById('dvAmount').value = '';
    document.getElementById('dvPercent').value = '';
    document.getElementById('calculatedDV').value = '';
  }
}

function addNonDVIngredient() {
  const nutrient = document.getElementById('nonDVIngredient').value;
  const amount = document.getElementById('nonDVAmount').value;
  const unit = document.getElementById('nonDVUnit').value;
  if (nutrient && amount && unit) {
    nonDVIngredients.push({ nutrient, amount, unit });
    updateNonDVList();
    document.getElementById('nonDVIngredient').value = '';
    document.getElementById('nonDVAmount').value = '';
    document.getElementById('nonDVUnit').value = '';
  }
}

function updateDVList() {
  const list = document.getElementById('dvList');
  list.innerHTML = '';
  dvIngredients.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = `${item.nutrient}: ${item.amount} ${item.unit}, ${item.percent}`;
    list.appendChild(li);
  });
}

function updateNonDVList() {
  const list = document.getElementById('nonDVList');
  list.innerHTML = '';
  nonDVIngredients.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = `${item.nutrient}: ${item.amount} ${item.unit}`;
    list.appendChild(li);
  });
}

function generatePanel() {
  const productName = document.getElementById('productName').value || 'Not specified';
  const servingSize = document.getElementById('servingSize').value || 'Not specified';
  const servings = document.getElementById('servings').value || 'Not specified';
  const output = document.getElementById('supplementFacts');

  let dvRows = dvIngredients.map(item => {
    const percentMatch = item.percent.match(/(\d*\.?\d+)/);
    const percentValue = percentMatch ? parseFloat(percentMatch[0]) : 0;
    const displayPercent = (percentValue === 0 || percentValue < 1) ? '<1%' : item.percent;
    return `<tr><td>${item.nutrient}</td><td>${item.amount} ${item.unit}</td><td>${displayPercent}</td></tr>`;
  }).join('');
  
  let nonDVRows = nonDVIngredients.map(item => `
    <tr><td>${item.nutrient}</td><td>${item.amount} ${item.unit}</td></tr>
  `).join('');

  output.innerHTML = `
    <div class="product-name">${productName}</div>
    <div class="supplement-facts">
      <div class="title">Supplement Facts</div>
      <div class="serving">Serving Size: ${servingSize}</div>
      <div class="serving">Servings Per Container: ${servings}</div>
      <table class="table">${dvRows}</table>
      <div class="divider"></div>
      <table class="table">${nonDVRows}</table>
    </div>
  `;
}

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

  fetch('http://localhost:3000/save-panel', {
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
  fetch('http://localhost:3000/get-panels')
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
  // Auto-select the first item if there’s at least one match
  if (panels.length > 0) {
    select.selectedIndex = 1; // Skip the "Select a saved panel" option
  } else {
    select.selectedIndex = 0; // Default to placeholder if no matches
  }
}

function filterPanels(searchTerm) {
  const searchLower = searchTerm.toLowerCase();
  const filteredPanels = allPanels
    .map(panel => {
      const skuLower = panel.sku.toLowerCase();
      const nameLower = panel.productName.toLowerCase();
      // Calculate relevance score: exact match > starts with > includes
      let score = 0;
      if (skuLower === searchLower || nameLower === searchLower) score = 3; // Exact match
      else if (skuLower.startsWith(searchLower) || nameLower.startsWith(searchLower)) score = 2; // Starts with
      else if (skuLower.includes(searchLower) || nameLower.includes(searchLower)) score = 1; // Contains
      return { panel, score };
    })
    .filter(item => item.score > 0) // Only keep matches
    .sort((a, b) => b.score - a.score || a.panel.timestamp.localeCompare(b.panel.timestamp)) // Sort by score, then timestamp
    .map(item => item.panel); // Extract panels

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

  fetch(`http://localhost:3000/get-panels?id=${panelId}`)
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