/**
 * AuraMeal Frontend Application Controller
 * Coordinates UI, State, LocalStorage, and interacts with the MealAgent.
 */

document.addEventListener("DOMContentLoaded", () => {
    // -----------------------------------------
    // 1. STATE INITIALIZATION
    // -----------------------------------------
    let state = {
        activePlan: null,
        profile: {
            dietType: "balanced",
            calorieTarget: 2000,
            allergies: [],
            pantry: ["egg", "spinach", "cherry tomatoes", "olive oil"]
        },
        viewMode: "weekly", // 'weekly' or 'daily'
        activeDay: "Monday"
    };

    // Load state from localStorage if it exists
    const savedState = localStorage.getItem("aurameal_state");
    if (savedState) {
        try {
            state = JSON.parse(savedState);
        } catch (e) {
            console.error("Failed to load saved state", e);
        }
    }

    // If no active plan, generate one by default
    if (!state.activePlan) {
        state.activePlan = window.generateWeekPlan(
            state.profile.dietType,
            state.profile.allergies,
            state.profile.calorieTarget
        );
        saveState();
    }

    // Instantiate Agent
    const agent = new window.MealAgent();

    // -----------------------------------------
    // 2. DOM ELEMENT CACHING
    // -----------------------------------------
    const dietTypeSelect = document.getElementById("diet-type");
    const calorieTargetInput = document.getElementById("calorie-target");
    const calorieValSpan = document.getElementById("calorie-val");
    const applyProfileBtn = document.getElementById("apply-profile-btn");
    const allergyTags = document.querySelectorAll(".tag-checkbox");
    
    const pantryItemInput = document.getElementById("pantry-item-input");
    const addPantryBtn = document.getElementById("add-pantry-btn");
    const pantryListDiv = document.getElementById("pantry-list");
    const planWithPantryBtn = document.getElementById("plan-with-pantry-btn");

    const weeklyViewBtn = document.getElementById("weekly-view-btn");
    const dailyViewBtn = document.getElementById("daily-view-btn");
    const weeklyGridDiv = document.getElementById("weekly-grid");
    const dailyContainerDiv = document.getElementById("daily-container");
    const dailyMealListDiv = document.getElementById("daily-meal-list");
    const currentDailyTitle = document.getElementById("current-daily-title");
    const prevDayBtn = document.getElementById("prev-day-btn");
    const nextDayBtn = document.getElementById("next-day-btn");
    
    const planMacroSummaryDiv = document.getElementById("plan-macro-summary");

    const chatMessagesDiv = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input");
    const sendChatBtn = document.getElementById("send-chat-btn");
    const clearChatBtn = document.getElementById("clear-chat-btn");
    const suggestionChips = document.querySelectorAll(".suggestion-chips .chip");
    
    const thinkingTerminalDiv = document.getElementById("thinking-terminal");
    const thinkingContentDiv = document.getElementById("thinking-content");

    const recipeModal = document.getElementById("recipe-modal");
    const closeRecipeModalBtn = document.getElementById("close-recipe-modal");
    const modalRecipeContent = document.getElementById("modal-recipe-content");

    const shoppingModal = document.getElementById("shopping-modal");
    const viewShoppingListBtn = document.getElementById("view-shopping-list-btn");
    const closeShoppingModalBtn = document.getElementById("close-shopping-modal");
    const shoppingCategoriesContainer = document.getElementById("shopping-categories-container");
    const copyShoppingListBtn = document.getElementById("copy-shopping-list");
    const clearShoppingChecklistBtn = document.getElementById("clear-shopping-checklist");

    // -----------------------------------------
    // 3. UTILITY & STORAGE HELPERS
    // -----------------------------------------
    function saveState() {
        localStorage.setItem("aurameal_state", JSON.stringify(state));
    }

    const DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // -----------------------------------------
    // 4. RENDER FUNCTIONS
    // -----------------------------------------

    // Render Macro Nutrition Summary
    function renderMacroSummary() {
        if (!state.activePlan) return;
        
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;
        let count = 0;

        DAYS_ORDER.forEach(day => {
            const dayMeals = state.activePlan[day];
            if (dayMeals) {
                Object.values(dayMeals).forEach(meal => {
                    if (meal) {
                        totalCalories += meal.calories || 0;
                        totalProtein += meal.macros?.protein || 0;
                        totalCarbs += meal.macros?.carbs || 0;
                        totalFat += meal.macros?.fat || 0;
                        count++;
                    }
                });
            }
        });

        // Calculate average per day
        const numDays = DAYS_ORDER.length;
        const avgCals = Math.round(totalCalories / numDays);
        const avgP = Math.round(totalProtein / numDays);
        const avgC = Math.round(totalCarbs / numDays);
        const avgF = Math.round(totalFat / numDays);

        planMacroSummaryDiv.innerHTML = `
            <div class="macro-summary-pill" style="color: var(--color-accent);">
                🔥 Avg: <span>${avgCals} kcal/day</span>
            </div>
            <div class="macro-summary-pill" style="color: #fca5a5;">
                🍗 P: <span>${avgP}g</span>
            </div>
            <div class="macro-summary-pill" style="color: #93c5fd;">
                🌾 C: <span>${avgC}g</span>
            </div>
            <div class="macro-summary-pill" style="color: #fde047;">
                🥑 F: <span>${avgF}g</span>
            </div>
        `;
    }

    // Render Weekly Grid
    function renderWeeklyGrid() {
        weeklyGridDiv.innerHTML = "";
        
        DAYS_ORDER.forEach(day => {
            const dayCol = document.createElement("div");
            dayCol.className = "day-column";
            if (day === state.activeDay) {
                dayCol.classList.add("active-day-col");
            }

            // Day Header
            const header = document.createElement("div");
            header.className = "day-header";
            header.innerHTML = `
                <h3>${day}</h3>
                <div class="date-sub">${day.substring(0,3).toUpperCase()} SCHEDULE</div>
            `;
            header.addEventListener("click", () => {
                state.activeDay = day;
                renderWeeklyGrid();
                renderDailyView();
            });
            dayCol.appendChild(header);

            // Day Meals
            const mealsContainer = document.createElement("div");
            mealsContainer.className = "day-meals";

            const dayMeals = state.activePlan[day] || {};
            const mealTimes = ["breakfast", "lunch", "dinner", "snack"];

            mealTimes.forEach(mealTime => {
                const meal = dayMeals[mealTime];
                if (!meal) return;

                const mealCard = document.createElement("div");
                mealCard.className = "meal-card";
                mealCard.setAttribute("data-meal-time", mealTime);
                
                mealCard.innerHTML = `
                    <span class="meal-time-tag">${mealTime}</span>
                    <h4 class="meal-title" title="${meal.name}">${meal.name}</h4>
                    <div class="meal-cals">${meal.calories} kcal</div>
                    <div class="meal-macros-row">
                        <span>P: ${meal.macros?.protein}g</span>
                        <span>C: ${meal.macros?.carbs}g</span>
                        <span>F: ${meal.macros?.fat}g</span>
                    </div>
                    <div class="meal-actions-overlay">
                        <button class="btn-card-action view-action">🔍 Details</button>
                        <button class="btn-card-action swap-action">🔄 Swap</button>
                    </div>
                `;

                // Card action listeners
                mealCard.querySelector(".view-action").addEventListener("click", (e) => {
                    e.stopPropagation();
                    openRecipeModal(meal);
                });

                mealCard.querySelector(".swap-action").addEventListener("click", async (e) => {
                    e.stopPropagation();
                    const prompt = `Swap ${day} ${mealTime}`;
                    chatInput.value = prompt;
                    handleChatSubmit();
                });

                mealCard.addEventListener("click", () => {
                    openRecipeModal(meal);
                });

                mealsContainer.appendChild(mealCard);
            });

            dayCol.appendChild(mealsContainer);
            weeklyGridDiv.appendChild(dayCol);
        });
    }

    // Render Daily View Details
    function renderDailyView() {
        currentDailyTitle.textContent = state.activeDay;
        dailyMealListDiv.innerHTML = "";

        const dayMeals = state.activePlan[state.activeDay] || {};
        const mealTimes = ["breakfast", "lunch", "dinner", "snack"];

        mealTimes.forEach(mealTime => {
            const meal = dayMeals[mealTime];
            if (!meal) return;

            const row = document.createElement("div");
            row.className = "daily-meal-row";
            
            row.innerHTML = `
                <div class="daily-meal-label-col">
                    <span class="meal-time-tag">${mealTime}</span>
                    <h4>${mealTime}</h4>
                </div>
                <div class="daily-meal-info-col">
                    <h3>${meal.name}</h3>
                    <div class="daily-meal-macro-bar-container">
                        <span>🔥 <strong>${meal.calories}</strong> kcal</span>
                        <span>🍗 Protein: <strong>${meal.macros?.protein}g</strong></span>
                        <span>🌾 Carbs: <strong>${meal.macros?.carbs}g</strong></span>
                        <span>🥑 Fat: <strong>${meal.macros?.fat}g</strong></span>
                    </div>
                </div>
                <div class="daily-meal-actions-col">
                    <button class="btn btn-secondary btn-sm view-btn">View Recipe</button>
                    <button class="btn btn-outline btn-sm swap-btn">Swap</button>
                </div>
            `;

            row.querySelector(".view-btn").addEventListener("click", () => openRecipeModal(meal));
            row.querySelector(".swap-btn").addEventListener("click", () => {
                chatInput.value = `Swap ${state.activeDay} ${mealTime}`;
                handleChatSubmit();
            });

            dailyMealListDiv.appendChild(row);
        });
    }

    // Render Pantry tags
    function renderPantry() {
        pantryListDiv.innerHTML = "";
        state.profile.pantry.forEach(item => {
            const tag = document.createElement("div");
            tag.className = "pantry-tag";
            tag.innerHTML = `
                <span>${item}</span>
                <button class="pantry-tag-remove">&times;</button>
            `;
            tag.querySelector(".pantry-tag-remove").addEventListener("click", () => {
                state.profile.pantry = state.profile.pantry.filter(i => i !== item);
                saveState();
                renderPantry();
            });
            pantryListDiv.appendChild(tag);
        });
    }

    // Sync input controls with current state
    function syncControls() {
        dietTypeSelect.value = state.profile.dietType;
        calorieTargetInput.value = state.profile.calorieTarget;
        calorieValSpan.textContent = `${state.profile.calorieTarget.toLocaleString()} kcal`;
        
        // Allergy tags
        allergyTags.forEach(tag => {
            const allergy = tag.getAttribute("data-allergy");
            if (state.profile.allergies.includes(allergy)) {
                tag.classList.add("selected");
            } else {
                tag.classList.remove("selected");
            }
        });
    }

    // -----------------------------------------
    // 5. MODAL LOGIC
    // -----------------------------------------

    // Recipe Modal
    function openRecipeModal(recipe) {
        recipeModal.classList.remove("hidden");
        
        // Build macro breakdown percentage bars or simple checklist
        const proteinPct = Math.round((recipe.macros.protein * 4 / recipe.calories) * 100);
        const carbsPct = Math.round((recipe.macros.carbs * 4 / recipe.calories) * 100);
        const fatPct = Math.round((recipe.macros.fat * 9 / recipe.calories) * 100);

        modalRecipeContent.innerHTML = `
            <div class="modal-recipe-header">
                <h2>${recipe.name}</h2>
                <div class="recipe-modal-meta">
                    <span>⏱️ Prep: <strong>${recipe.prepTime}</strong></span>
                    <span>🏷️ Diet: <strong style="text-transform: capitalize;">${recipe.diet.join(", ")}</strong></span>
                    <span>🔥 Calories: <strong>${recipe.calories} kcal</strong></span>
                </div>
            </div>
            
            <div class="recipe-grid-2col">
                <div>
                    <h3 class="recipe-section-title">Ingredients Needed</h3>
                    <ul class="ingredients-list">
                        ${recipe.ingredients.map(ing => `
                            <li>
                                <input type="checkbox" style="margin-right: 0.5rem; accent-color: var(--color-accent);">
                                <strong>${ing.amount}</strong> ${ing.name} <span style="color: var(--text-muted); font-size: 0.75rem;">(${ing.category})</span>
                            </li>
                        `).join("")}
                    </ul>
                </div>
                <div>
                    <h3 class="recipe-section-title">Preparation Steps</h3>
                    <ol class="instructions-steps">
                        ${recipe.instructions.map(step => `<li>${step}</li>`).join("")}
                    </ol>
                    
                    <h3 class="recipe-section-title" style="margin-top: 1.5rem;">Macro Breakdown</h3>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem; background: rgba(0,0,0,0.2); padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
                            <span>🍗 Protein (${recipe.macros.protein}g)</span>
                            <span>${proteinPct}%</span>
                        </div>
                        <div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden;">
                            <div style="width: ${proteinPct}%; height: 100%; background: #fca5a5;"></div>
                        </div>

                        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-top: 0.25rem;">
                            <span>🌾 Carbs (${recipe.macros.carbs}g)</span>
                            <span>${carbsPct}%</span>
                        </div>
                        <div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden;">
                            <div style="width: ${carbsPct}%; height: 100%; background: #93c5fd;"></div>
                        </div>

                        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-top: 0.25rem;">
                            <span>🥑 Fat (${recipe.macros.fat}g)</span>
                            <span>${fatPct}%</span>
                        </div>
                        <div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden;">
                            <div style="width: ${fatPct}%; height: 100%; background: #fde047;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function closeRecipeModal() {
        recipeModal.classList.add("hidden");
    }

    // Shopping List modal & generator
    function openShoppingModal() {
        shoppingModal.classList.remove("hidden");
        shoppingCategoriesContainer.innerHTML = "";

        if (!state.activePlan) return;

        // Group ingredients by department/category
        const ingredientsMap = {};

        DAYS_ORDER.forEach(day => {
            const meals = state.activePlan[day] || {};
            Object.values(meals).forEach(meal => {
                if (!meal) return;
                meal.ingredients.forEach(ing => {
                    const cat = ing.category || "Pantry & Miscellaneous";
                    const key = ing.name.toLowerCase().trim();
                    
                    if (!ingredientsMap[cat]) {
                        ingredientsMap[cat] = {};
                    }

                    if (!ingredientsMap[cat][key]) {
                        ingredientsMap[cat][key] = {
                            name: ing.name,
                            amounts: []
                        };
                    }
                    ingredientsMap[cat][key].amounts.push(ing.amount);
                });
            });
        });

        // Draw checklist
        Object.keys(ingredientsMap).sort().forEach(cat => {
            const section = document.createElement("div");
            section.className = "shopping-category-section";
            
            const title = document.createElement("h4");
            title.textContent = cat;
            section.appendChild(title);

            const list = document.createElement("ul");
            list.className = "shopping-checklist";

            const items = ingredientsMap[cat];
            Object.keys(items).sort().forEach(key => {
                const item = items[key];
                
                // Consolidate identical/similar amount strings if possible
                // For simplicity, we join the amount details (e.g. "1 medium + 1/2 medium")
                // Or list them nicely
                const uniqueAmounts = [...new Set(item.amounts)];
                let amountStr = uniqueAmounts.join(" & ");

                const li = document.createElement("li");
                li.className = "shopping-item";
                li.innerHTML = `
                    <input type="checkbox">
                    <span><strong>${amountStr}</strong> ${item.name}</span>
                `;

                // Checklist strike-through toggle
                li.addEventListener("click", (e) => {
                    // Prevent trigger twice if clicking checkbox directly
                    if (e.target.tagName !== "INPUT") {
                        const box = li.querySelector("input");
                        box.checked = !box.checked;
                    }
                    li.classList.toggle("checked");
                });

                list.appendChild(li);
            });

            section.appendChild(list);
            shoppingCategoriesContainer.appendChild(section);
        });
    }

    function closeShoppingModal() {
        shoppingModal.classList.add("hidden");
    }

    // Copy list to clipboard
    copyShoppingListBtn.addEventListener("click", () => {
        let listText = "AURAMEAL GROCERY SHOPPING LIST\n===============================\n\n";
        
        const sections = shoppingCategoriesContainer.querySelectorAll(".shopping-category-section");
        sections.forEach(sec => {
            const catTitle = sec.querySelector("h4").textContent;
            listText += `${catTitle.toUpperCase()}\n`;
            
            const items = sec.querySelectorAll(".shopping-item");
            items.forEach(item => {
                const isChecked = item.classList.contains("checked") ? "[x]" : "[ ]";
                const content = item.querySelector("span").innerText;
                listText += ` ${isChecked} ${content}\n`;
            });
            listText += "\n";
        });

        navigator.clipboard.writeText(listText).then(() => {
            const oldText = copyShoppingListBtn.textContent;
            copyShoppingListBtn.textContent = "📋 Copied!";
            setTimeout(() => {
                copyShoppingListBtn.textContent = oldText;
            }, 1500);
        });
    });

    // Reset Checklist checkboxes
    clearShoppingChecklistBtn.addEventListener("click", () => {
        const items = shoppingCategoriesContainer.querySelectorAll(".shopping-item");
        items.forEach(item => {
            item.classList.remove("checked");
            const box = item.querySelector("input");
            if (box) box.checked = false;
        });
    });

    // -----------------------------------------
    // 6. CHAT & AGENT COMMUNICATION
    // -----------------------------------------
    function addMessage(sender, content, className = "") {
        const msgDiv = document.createElement("div");
        msgDiv.className = `message ${sender}-message ${className}`;
        msgDiv.innerHTML = `
            <div class="message-content">
                ${content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
            </div>
        `;
        chatMessagesDiv.appendChild(msgDiv);
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    }

    async function handleChatSubmit() {
        const command = chatInput.value.trim();
        if (!command) return;

        // Display user message
        addMessage("user", command);
        chatInput.value = "";

        // Reset and show thinking terminal
        thinkingTerminalDiv.classList.remove("hidden");
        thinkingContentDiv.innerHTML = "";
        
        // Intercept log callbacks from agent
        const logCallback = (msg, type) => {
            const line = document.createElement("div");
            line.className = `terminal-line ${type}`;
            line.textContent = `> ${msg}`;
            thinkingContentDiv.appendChild(line);
            thinkingContentDiv.scrollTop = thinkingContentDiv.scrollHeight;
        };

        try {
            // Process command through Agent
            const response = await agent.processCommand(command, state.activePlan, state.profile, logCallback);
            
            // Apply updates depending on action
            if (response.action === "GENERATE_PLAN" || response.action === "UPDATE_PLAN") {
                state.activePlan = response.updatedPlan;
                
                // If profile variables updated
                if (response.newProfileSettings) {
                    state.profile.dietType = response.newProfileSettings.dietType;
                    state.profile.calorieTarget = response.newProfileSettings.calorieTarget;
                    syncControls();
                }
                
                saveState();
                renderWeeklyGrid();
                renderDailyView();
                renderMacroSummary();
            } else if (response.action === "SHOW_SHOPPING_LIST") {
                openShoppingModal();
            }

            // Hide thinking terminal with a small delay
            setTimeout(() => {
                thinkingTerminalDiv.classList.add("hidden");
            }, 800);

            // Display Agent reply
            addMessage("agent", response.reply);

        } catch (err) {
            console.error("Agent process error:", err);
            thinkingTerminalDiv.classList.add("hidden");
            addMessage("agent", "Apologies, I encountered an internal glitch while planning. Please try again or rephrase your request.");
        }
    }

    // -----------------------------------------
    // 7. EVENT BINDING
    // -----------------------------------------

    // Profile Settings Apply
    applyProfileBtn.addEventListener("click", () => {
        state.profile.dietType = dietTypeSelect.value;
        state.profile.calorieTarget = parseInt(calorieTargetInput.value);
        
        // Generate new plan from scratch based on updated parameters
        state.activePlan = window.generateWeekPlan(
            state.profile.dietType,
            state.profile.allergies,
            state.profile.calorieTarget
        );
        
        saveState();
        renderWeeklyGrid();
        renderDailyView();
        renderMacroSummary();
        
        addMessage("agent", `I have updated your dietary profile and automatically regenerated your 7-day meal plan to match! \n\n- **Diet:** ${state.profile.dietType.toUpperCase()}\n- **Calories:** ${state.profile.calorieTarget} kcal\n- **Allergies Avoided:** ${state.profile.allergies.join(", ") || "None"}`);
    });

    calorieTargetInput.addEventListener("input", (e) => {
        calorieValSpan.textContent = `${parseInt(e.target.value).toLocaleString()} kcal`;
    });

    // Allergy Tags Click handler
    allergyTags.forEach(tag => {
        tag.addEventListener("click", () => {
            const allergy = tag.getAttribute("data-allergy");
            tag.classList.toggle("selected");
            
            if (tag.classList.contains("selected")) {
                if (!state.profile.allergies.includes(allergy)) {
                    state.profile.allergies.push(allergy);
                }
            } else {
                state.profile.allergies = state.profile.allergies.filter(a => a !== allergy);
            }
            saveState();
        });
    });

    // Pantry Add Handler
    function handleAddPantry() {
        const item = pantryItemInput.value.trim().toLowerCase();
        if (item && !state.profile.pantry.includes(item)) {
            state.profile.pantry.push(item);
            saveState();
            renderPantry();
            pantryItemInput.value = "";
        }
    }
    addPantryBtn.addEventListener("click", handleAddPantry);
    pantryItemInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleAddPantry();
    });

    // Cook from Pantry trigger
    planWithPantryBtn.addEventListener("click", () => {
        chatInput.value = "Cook from my pantry inventory";
        handleChatSubmit();
    });

    // Grid View Toggles
    weeklyViewBtn.addEventListener("click", () => {
        weeklyViewBtn.classList.add("active");
        dailyViewBtn.classList.remove("active");
        weeklyGridDiv.classList.remove("hidden");
        dailyContainerDiv.classList.add("hidden");
        state.viewMode = "weekly";
        saveState();
    });

    dailyViewBtn.addEventListener("click", () => {
        dailyViewBtn.classList.add("active");
        weeklyViewBtn.classList.remove("active");
        weeklyGridDiv.classList.add("hidden");
        dailyContainerDiv.classList.remove("hidden");
        state.viewMode = "daily";
        saveState();
        renderDailyView();
    });

    // Daily Navigator arrows
    prevDayBtn.addEventListener("click", () => {
        let idx = DAYS_ORDER.indexOf(state.activeDay);
        idx = (idx - 1 + 7) % 7;
        state.activeDay = DAYS_ORDER[idx];
        saveState();
        renderWeeklyGrid();
        renderDailyView();
    });

    nextDayBtn.addEventListener("click", () => {
        let idx = DAYS_ORDER.indexOf(state.activeDay);
        idx = (idx + 1) % 7;
        state.activeDay = DAYS_ORDER[idx];
        saveState();
        renderWeeklyGrid();
        renderDailyView();
    });

    // Chat Events
    sendChatBtn.addEventListener("click", handleChatSubmit);
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleChatSubmit();
        }
    });

    clearChatBtn.addEventListener("click", () => {
        chatMessagesDiv.innerHTML = `
            <div class="message system-message">
                <div class="message-content">
                    Welcome back! Conversation cleared. Ask me to design a meal plan, swap meals, check your pantry, or compile your shopping list.
                </div>
            </div>
        `;
    });

    // Suggestion Chips Click
    suggestionChips.forEach(chip => {
        chip.addEventListener("click", () => {
            chatInput.value = chip.getAttribute("data-prompt");
            handleChatSubmit();
        });
    });

    // Modal Close Triggers
    closeRecipeModalBtn.addEventListener("click", closeRecipeModal);
    recipeModal.addEventListener("click", (e) => {
        if (e.target === recipeModal) closeRecipeModal();
    });

    viewShoppingListBtn.addEventListener("click", openShoppingModal);
    closeShoppingModalBtn.addEventListener("click", closeShoppingModal);
    shoppingModal.addEventListener("click", (e) => {
        if (e.target === shoppingModal) closeShoppingModal();
    });

    // -----------------------------------------
    // 8. INITIAL RENDERING SEQUENCE
    // -----------------------------------------
    syncControls();
    renderPantry();
    renderMacroSummary();
    renderWeeklyGrid();
    renderDailyView();

    // Toggle initial view mode tab
    if (state.viewMode === "daily") {
        dailyViewBtn.click();
    } else {
        weeklyViewBtn.click();
    }
});
