// ingredientsData.js
module.exports = {
    fdaIngredients: {
      Vitamins: {
        "Fat-Soluble": [
          { name: "Vitamin A", unit: "mcg RAE", rdi: 900 },
          { name: "Vitamin D", unit: "mcg", rdi: 20 },
          { name: "Vitamin E", unit: "mg", rdi: 15 },
          { name: "Vitamin K", unit: "mcg", rdi: 120 }
        ],
        "Water-Soluble": [
          { name: "Vitamin C", unit: "mg", rdi: 90 },
          { name: "Thiamin", unit: "mg", rdi: 1.2 },
          { name: "Riboflavin", unit: "mg", rdi: 1.3 },
          { name: "Niacin", unit: "mg NE", rdi: 16 },
          { name: "Vitamin B6", unit: "mg", rdi: 1.7 },
          { name: "Folate", unit: "mcg DFE", rdi: 400 },
          { name: "Vitamin B12", unit: "mcg", rdi: 2.4 },
          { name: "Biotin", unit: "mcg", rdi: 30 },
          { name: "Pantothenic Acid", unit: "mg", rdi: 5 }
        ]
      },
      Minerals: {
        "Macrominerals": [
          { name: "Calcium", unit: "mg", rdi: 1300 },
          { name: "Phosphorus", unit: "mg", rdi: 1300 },
          { name: "Magnesium", unit: "mg", rdi: 420 },
          { name: "Potassium", unit: "mg", rdi: 4700 },
          { name: "Chloride", unit: "mg", rdi: 2300 }
        ],
        "Trace Minerals": [
          { name: "Iron", unit: "mg", rdi: 18 },
          { name: "Zinc", unit: "mg", rdi: 11 },
          { name: "Iodine", unit: "mcg", rdi: 150 },
          { name: "Selenium", unit: "mcg", rdi: 55 },
          { name: "Copper", unit: "mg", rdi: 0.9 },
          { name: "Manganese", unit: "mg", rdi: 2.3 },
          { name: "Chromium", unit: "mcg", rdi: 35 },
          { name: "Molybdenum", unit: "mcg", rdi: 45 }
        ]
      },
      Other: [
        { name: "Choline", unit: "mg", rdi: 550 }
      ]
    }
  };