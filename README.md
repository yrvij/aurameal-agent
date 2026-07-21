# ✦ AuraMeal // Autonomous Meal Planning Agent

AuraMeal is a premium, feature-rich web application that functions as an interactive, autonomous meal planning companion. It features a glowing glassmorphic dark-mode interface with a simulated AI reasoning console.

![AuraMeal UI Mockup](./aurameal_web_ui.jpg)

---

## 🚀 Key Features

### 1. 🤖 Aura AI Agent Interface
- **Interactive Chat**: Natural language interface allowing user actions like:
  - *"Generate a 1800 calorie keto plan"*
  - *"Swap Wednesday lunch"*
  - *"Recommend healthy snacks"*
  - *"Create a grocery list"*
- **Agent Thinking Console**: A simulated console terminal displaying internal logic processes step-by-step before finalizing response actions (e.g., parsing intent, checking constraints, matching food items).
- **Suggestion Chips**: Quick-click cards to run pre-populated agent prompts instantly.

### 2. 📅 Interactive Weekly / Daily Grid
- **Multi-View Layout**: Easily toggle between **Weekly Planner** grid and **Daily Details** rows.
- **Micro-Macro Nutrition Summary**: Live tracker calculated on the fly showing average daily calories and Carbs / Protein / Fat macro splits.
- **Quick Controls**: Individual meal cards support quick "Swap" shuffling and detailed modal pop-ups.

### 3. 🍲 Diet & Allergy Profile
- **Diet Selector**: Instantly choose balanced, keto, vegan, vegetarian, mediterranean, or paleo modes.
- **Calorie Limit Slider**: Dynamic daily target input adjusting plan distributions.
- **Allergy Filter Tags**: Toggle allergen exclusions like Nuts, Gluten, Dairy, Soy, and Shellfish. 

### 4. 🍎 Smart Pantry Matching
- **Fridge Inventory**: Input what ingredients you have at hand (e.g., eggs, spinach, tomatoes).
- **Cook from Pantry**: Let Aura search the recipe database and recommend matching recipes with instructions, ingredients list, and macros.

### 5. 🛒 Categorized Grocery Checklist
- **Consolidated List**: Compiles ingredients for all planned meals, automatically grouping items into departments (Produce, Proteins, Dairy, Pantry).
- **Interactive Checkboxes**: Mark off items you already have.
- **Copy Checklist**: Exports a clean text checklist straight to your clipboard.

---

## ⚡ Tech Stack & Architecture
- **Frontend**: Vanilla HTML5, Custom CSS3 (featuring HSL tailored glow variables and glassmorphism layouts), and Modular ES6 Javascript.
- **Backend**: Python 3 standard library `http.server` running a multi-threaded service.
- **State Management**: Persisted in the browser's `localStorage` to retain meal configurations and inventory status upon refreshing.

---

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone git@github.com:cloud-ai-fde/yrvij-ai-in-5-days-assessment.git
   cd yrvij-ai-in-5-days-assessment
   ```

2. **Start the local server**:
   ```bash
   python3 server.py
   ```

3. **Access the application**:
   Open [http://localhost:8080](http://localhost:8080) in your web browser.

---

## 📂 Project Structure
```text
├── index.html       # Primary HTML skeleton and modal layouts
├── style.css        # Styling definitions, variables, and responsive grids
├── app.js           # Main UI state, event listener bindings, and modal renders
├── agent.js         # Aura Agent NLP rule engine, recipe DB, and thinking simulator
├── server.py        # Lightweight multi-threaded local web server script
└── README.md        # Documentation
```
