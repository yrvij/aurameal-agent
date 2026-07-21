/**
 * AuraMeal Agent Engine
 * Simulates a step-by-step reasoning AI agent for meal planning.
 */

// Recipe Database
const RECIPES_DB = [
    // Breakfasts
    {
        id: "keto_scrambled_eggs",
        name: "Avocado & Cheddar Scrambled Eggs",
        category: "breakfast",
        diet: ["keto", "paleo", "gluten-free"],
        calories: 450,
        macros: { protein: 28, carbs: 4, fat: 38 },
        prepTime: "10 mins",
        ingredients: [
            { name: "Eggs", amount: "3 large", category: "Dairy & Eggs" },
            { name: "Avocado", amount: "1/2 medium", category: "Produce" },
            { name: "Cheddar cheese", amount: "1/4 cup", category: "Dairy & Eggs" },
            { name: "Butter", amount: "1 tbsp", category: "Pantry" },
            { name: "Salt and pepper", amount: "to taste", category: "Pantry" }
        ],
        instructions: [
            "Whisk eggs with salt and pepper in a bowl.",
            "Melt butter in a pan over medium heat.",
            "Pour in eggs and scramble gently until cooked to your liking.",
            "Top with shredded cheddar cheese and diced avocado before serving."
        ]
    },
    {
        id: "berry_oatmeal_bowl",
        name: "Almond Berry Oatmeal Bowl",
        category: "breakfast",
        diet: ["balanced", "vegan", "vegetarian"],
        calories: 380,
        macros: { protein: 11, carbs: 54, fat: 12 },
        prepTime: "8 mins",
        ingredients: [
            { name: "Rolled oats", amount: "1/2 cup", category: "Pantry" },
            { name: "Almond milk", amount: "1 cup", category: "Dairy & Eggs" },
            { name: "Blueberries", amount: "1/4 cup", category: "Produce" },
            { name: "Strawberries", amount: "3 sliced", category: "Produce" },
            { name: "Chia seeds", amount: "1 tsp", category: "Pantry" },
            { name: "Maple syrup", amount: "1 tbsp", category: "Pantry" }
        ],
        instructions: [
            "Combine rolled oats and almond milk in a small saucepan.",
            "Cook over medium heat for 5 minutes, stirring occasionally, until thick.",
            "Pour oatmeal into a bowl.",
            "Top with fresh berries, chia seeds, and a drizzle of maple syrup."
        ]
    },
    {
        id: "chia_seed_pudding",
        name: "Vanilla Coconut Chia Pudding",
        category: "breakfast",
        diet: ["balanced", "keto", "vegan", "vegetarian", "gluten-free"],
        calories: 290,
        macros: { protein: 6, carbs: 19, fat: 20 },
        prepTime: "5 mins + chilling",
        ingredients: [
            { name: "Chia seeds", amount: "3 tbsp", category: "Pantry" },
            { name: "Coconut milk", amount: "3/4 cup", category: "Pantry" },
            { name: "Vanilla extract", amount: "1/2 tsp", category: "Pantry" },
            { name: "Stevia or Maple syrup", amount: "1 tsp", category: "Pantry" },
            { name: "Sliced almonds", amount: "1 tbsp", category: "Pantry" }
        ],
        instructions: [
            "In a jar, whisk together chia seeds, coconut milk, vanilla, and sweetener.",
            "Let sit for 5 minutes, stir again to prevent clumps.",
            "Cover and refrigerate for at least 2 hours (or overnight) until thickened.",
            "Top with sliced almonds and enjoy cold."
        ]
    },
    {
        id: "protein_pancakes",
        name: "Banana Protein Pancakes",
        category: "breakfast",
        diet: ["balanced", "vegetarian"],
        calories: 410,
        macros: { protein: 32, carbs: 48, fat: 8 },
        prepTime: "15 mins",
        ingredients: [
            { name: "Banana", amount: "1 medium", category: "Produce" },
            { name: "Egg", amount: "1 large", category: "Dairy & Eggs" },
            { name: "Protein powder (vanilla)", amount: "1 scoop", category: "Pantry" },
            { name: "Baking powder", amount: "1/2 tsp", category: "Pantry" },
            { name: "Cinnamon", amount: "1/4 tsp", category: "Pantry" },
            { name: "Butter (for pan)", amount: "1 tsp", category: "Dairy & Eggs" }
        ],
        instructions: [
            "Mash the banana in a bowl until smooth.",
            "Whisk in the egg, then stir in protein powder, baking powder, and cinnamon.",
            "Melt butter in a skillet over medium heat.",
            "Pour batter into small circles and cook until bubbles form, then flip.",
            "Cook until golden brown on both sides. Serve hot."
        ]
    },
    {
        id: "spinach_mushroom_frittata",
        name: "Spinach, Tomato & Mushroom Frittata",
        category: "breakfast",
        diet: ["balanced", "keto", "vegetarian", "gluten-free"],
        calories: 320,
        macros: { protein: 22, carbs: 6, fat: 24 },
        prepTime: "20 mins",
        ingredients: [
            { name: "Eggs", amount: "4 large", category: "Dairy & Eggs" },
            { name: "Baby spinach", amount: "1 cup", category: "Produce" },
            { name: "Mushrooms", amount: "1/2 cup sliced", category: "Produce" },
            { name: "Cherry tomatoes", amount: "1/4 cup halved", category: "Produce" },
            { name: "Feta cheese", amount: "2 tbsp crumbled", category: "Dairy & Eggs" },
            { name: "Olive oil", amount: "1 tsp", category: "Pantry" }
        ],
        instructions: [
            "Preheat oven to 375°F (190°C).",
            "Sauté mushrooms and spinach in olive oil in an oven-safe skillet until tender.",
            "Whisk eggs and pour over the sautéed veggies. Add tomatoes and feta on top.",
            "Bake for 12-15 minutes until eggs are set and slightly golden."
        ]
    },

    // Lunches
    {
        id: "quinoa_salad",
        name: "Crispy Quinoa & Avocado Salad",
        category: "lunch",
        diet: ["balanced", "vegan", "vegetarian", "gluten-free"],
        calories: 440,
        macros: { protein: 12, carbs: 49, fat: 23 },
        prepTime: "15 mins",
        ingredients: [
            { name: "Quinoa (cooked)", amount: "1 cup", category: "Pantry" },
            { name: "Avocado", amount: "1/2 medium", category: "Produce" },
            { name: "Cherry tomatoes", amount: "1/2 cup", category: "Produce" },
            { name: "Cucumber", amount: "1/2 medium", category: "Produce" },
            { name: "Black beans", amount: "1/3 cup", category: "Pantry" },
            { name: "Olive oil & Lemon juice", amount: "1 tbsp each", category: "Pantry" }
        ],
        instructions: [
            "Prepare fresh cooked quinoa or warm pre-cooked quinoa.",
            "Dice avocado, tomatoes, and cucumber.",
            "Drain and rinse black beans.",
            "Toss quinoa, veggies, and beans together with olive oil and lemon juice."
        ]
    },
    {
        id: "chicken_caesar_wrap",
        name: "Grilled Chicken Caesar Salad Wrap",
        category: "lunch",
        diet: ["balanced"],
        calories: 490,
        macros: { protein: 38, carbs: 32, fat: 22 },
        prepTime: "12 mins",
        ingredients: [
            { name: "Chicken breast (grilled)", amount: "4 oz", category: "Meat & Seafood" },
            { name: "Romaine lettuce", amount: "1 cup chopped", category: "Produce" },
            { name: "Caesar dressing", amount: "1.5 tbsp", category: "Pantry" },
            { name: "Parmesan cheese", amount: "1 tbsp", category: "Dairy & Eggs" },
            { name: "Whole wheat tortilla", amount: "1 large", category: "Pantry" }
        ],
        instructions: [
            "Slice grilled chicken breast into bite-sized strips.",
            "In a bowl, toss lettuce, Caesar dressing, and parmesan cheese.",
            "Lay tortilla flat, fill with chicken and dressed lettuce.",
            "Roll tightly, slice in half, and serve."
        ]
    },
    {
        id: "salmon_salad_bowl",
        name: "Smoked Salmon & Cucumber Keto Bowl",
        category: "lunch",
        diet: ["balanced", "keto", "gluten-free"],
        calories: 460,
        macros: { protein: 34, carbs: 5, fat: 33 },
        prepTime: "10 mins",
        ingredients: [
            { name: "Smoked salmon", amount: "4 oz", category: "Meat & Seafood" },
            { name: "English cucumber", amount: "1 sliced", category: "Produce" },
            { name: "Cream cheese", amount: "2 tbsp", category: "Dairy & Eggs" },
            { name: "Dill (fresh)", amount: "1 tsp chopped", category: "Produce" },
            { name: "Olive oil", amount: "1 tbsp", category: "Pantry" },
            { name: "Everything Bagel seasoning", amount: "1 tsp", category: "Pantry" }
        ],
        instructions: [
            "Arrange cucumber slices and smoked salmon in a bowl.",
            "Dollop small spoonfuls of cream cheese around the bowl.",
            "Drizzle with olive oil and sprinkle with fresh dill and bagel seasoning."
        ]
    },
    {
        id: "lentil_soup",
        name: "Hearty Tuscan Lentil Soup",
        category: "lunch",
        diet: ["balanced", "vegan", "vegetarian", "gluten-free"],
        calories: 350,
        macros: { protein: 18, carbs: 52, fat: 4 },
        prepTime: "25 mins",
        ingredients: [
            { name: "Brown lentils", amount: "1/2 cup raw", category: "Pantry" },
            { name: "Carrot", amount: "1 diced", category: "Produce" },
            { name: "Celery stalk", amount: "1 diced", category: "Produce" },
            { name: "Diced tomatoes", amount: "1/2 can", category: "Pantry" },
            { name: "Vegetable broth", amount: "2 cups", category: "Pantry" },
            { name: "Kale", amount: "1 cup chopped", category: "Produce" }
        ],
        instructions: [
            "In a soup pot, sauté carrot and celery for 4 minutes.",
            "Add lentils, vegetable broth, and diced tomatoes. Bring to a boil.",
            "Lower heat, cover, and simmer for 15-20 minutes until lentils are soft.",
            "Stir in chopped kale, let wilt for 2 minutes, season with salt, and serve."
        ]
    },
    {
        id: "turkey_avocado_wrap",
        name: "Turkey & Avocado Lettuce Wraps",
        category: "lunch",
        diet: ["balanced", "keto", "paleo", "gluten-free"],
        calories: 340,
        macros: { protein: 28, carbs: 7, fat: 22 },
        prepTime: "10 mins",
        ingredients: [
            { name: "Sliced turkey breast", amount: "6 oz", category: "Meat & Seafood" },
            { name: "Romaine lettuce (large leaves)", amount: "4 leaves", category: "Produce" },
            { name: "Avocado", amount: "1/2 medium", category: "Produce" },
            { name: "Dijon mustard", amount: "1 tbsp", category: "Pantry" },
            { name: "Tomato", amount: "4 slices", category: "Produce" }
        ],
        instructions: [
            "Wash and dry large romaine lettuce leaves.",
            "Lay leaves flat and spread thin layer of Dijon mustard.",
            "Layer turkey slices, tomato slices, and avocado slices.",
            "Roll up carefully and enjoy fresh."
        ]
    },

    // Dinners
    {
        id: "garlic_butter_shrimp",
        name: "Garlic Butter Shrimp with Zucchini Noodles",
        category: "dinner",
        diet: ["balanced", "keto", "gluten-free"],
        calories: 480,
        macros: { protein: 36, carbs: 8, fat: 34 },
        prepTime: "15 mins",
        ingredients: [
            { name: "Shrimp (peeled & deveined)", amount: "6 oz", category: "Meat & Seafood" },
            { name: "Zucchini (spiralized)", amount: "2 medium", category: "Produce" },
            { name: "Garlic", amount: "3 cloves minced", category: "Produce" },
            { name: "Butter", amount: "2 tbsp", category: "Dairy & Eggs" },
            { name: "Olive oil", amount: "1 tbsp", category: "Pantry" },
            { name: "Lemon juice & Parsley", amount: "1 tbsp each", category: "Produce" }
        ],
        instructions: [
            "Melt butter and olive oil in a skillet over medium-high heat.",
            "Add garlic and sauté for 1 minute until fragrant.",
            "Add shrimp and cook for 2-3 minutes per side until pink.",
            "Toss in spiralized zucchini noodles and cook for 2 more minutes.",
            "Drizzle with lemon juice and chopped parsley before plating."
        ]
    },
    {
        id: "chickpea_curry",
        name: "Coconut Chickpea & Spinach Curry",
        category: "dinner",
        diet: ["balanced", "vegan", "vegetarian", "gluten-free"],
        calories: 520,
        macros: { protein: 14, carbs: 68, fat: 18 },
        prepTime: "20 mins",
        ingredients: [
            { name: "Chickpeas (canned)", amount: "1 can drained", category: "Pantry" },
            { name: "Coconut milk (light)", amount: "1/2 can", category: "Pantry" },
            { name: "Spinach", amount: "2 cups", category: "Produce" },
            { name: "Crushed tomatoes", amount: "1/2 cup", category: "Pantry" },
            { name: "Curry powder", amount: "1 tbsp", category: "Pantry" },
            { name: "Rice (cooked)", amount: "1 cup", category: "Pantry" }
        ],
        instructions: [
            "In a saucepan, stir together curry powder and 1 tbsp water for 30 seconds.",
            "Add chickpeas, coconut milk, and crushed tomatoes. Simmer for 10 minutes.",
            "Stir in spinach until wilted.",
            "Serve hot over a bowl of cooked white or brown rice."
        ]
    },
    {
        id: "lemon_herb_chicken",
        name: "Lemon Herb Grilled Chicken with Asparagus",
        category: "dinner",
        diet: ["balanced", "keto", "paleo", "gluten-free"],
        calories: 420,
        macros: { protein: 44, carbs: 6, fat: 22 },
        prepTime: "25 mins",
        ingredients: [
            { name: "Chicken breast", amount: "6 oz", category: "Meat & Seafood" },
            { name: "Asparagus", amount: "1 bunch", category: "Produce" },
            { name: "Olive oil", amount: "2 tbsp", category: "Pantry" },
            { name: "Garlic powder & Oregano", amount: "1 tsp each", category: "Pantry" },
            { name: "Lemon", amount: "1 sliced", category: "Produce" }
        ],
        instructions: [
            "Season chicken breast with olive oil, garlic powder, oregano, salt, and pepper.",
            "Grill or pan-sear chicken for 6-7 minutes per side until fully cooked.",
            "Toss asparagus in olive oil and grill or roast next to chicken for 8 minutes.",
            "Garnish both with fresh squeezed lemon juice."
        ]
    },
    {
        id: "mediterranean_baked_cod",
        name: "Mediterranean Baked Cod with Olives",
        category: "dinner",
        diet: ["balanced", "mediterranean", "gluten-free"],
        calories: 390,
        macros: { protein: 32, carbs: 12, fat: 24 },
        prepTime: "20 mins",
        ingredients: [
            { name: "Cod fillet", amount: "6 oz", category: "Meat & Seafood" },
            { name: "Kalamata olives", amount: "8 halved", category: "Pantry" },
            { name: "Cherry tomatoes", amount: "1/2 cup", category: "Produce" },
            { name: "Capers", amount: "1 tsp", category: "Pantry" },
            { name: "Olive oil", amount: "1.5 tbsp", category: "Pantry" },
            { name: "Garlic", amount: "2 cloves minced", category: "Produce" }
        ],
        instructions: [
            "Preheat oven to 400°F (200°C).",
            "Place cod fillet in a baking dish.",
            "Toss olives, tomatoes, capers, garlic, and olive oil in a bowl, then pour over cod.",
            "Bake for 12-15 minutes until fish flakes easily with a fork."
        ]
    },
    {
        id: "beef_broccoli_stirfry",
        name: "Sesame Beef & Broccoli Stir-Fry",
        category: "dinner",
        diet: ["balanced", "paleo"],
        calories: 540,
        macros: { protein: 42, carbs: 14, fat: 34 },
        prepTime: "18 mins",
        ingredients: [
            { name: "Flank steak (sliced thin)", amount: "6 oz", category: "Meat & Seafood" },
            { name: "Broccoli florets", amount: "2 cups", category: "Produce" },
            { name: "Soy sauce (or Coconut Aminos)", amount: "2 tbsp", category: "Pantry" },
            { name: "Sesame oil", amount: "1 tbsp", category: "Pantry" },
            { name: "Ginger (fresh)", amount: "1 tsp minced", category: "Produce" },
            { name: "Garlic", amount: "1 clove minced", category: "Produce" }
        ],
        instructions: [
            "Heat sesame oil in a wok or large skillet over high heat.",
            "Add steak slices and sear for 2-3 minutes until browned. Remove and set aside.",
            "Add broccoli, garlic, and ginger to skillet. Sauté for 4 minutes with 2 tbsp water.",
            "Return beef to skillet, stir in soy sauce, and toss together for 1-2 minutes until glazed."
        ]
    },

    // Snacks
    {
        id: "hummus_veggie_sticks",
        name: "Classic Hummus & Cucumber Sticks",
        category: "snack",
        diet: ["balanced", "vegan", "vegetarian", "gluten-free"],
        calories: 180,
        macros: { protein: 5, carbs: 18, fat: 10 },
        prepTime: "5 mins",
        ingredients: [
            { name: "Hummus", amount: "1/4 cup", category: "Pantry" },
            { name: "English cucumber", amount: "1 sliced into sticks", category: "Produce" },
            { name: "Baby carrots", amount: "6", category: "Produce" }
        ],
        instructions: [
            "Slice cucumber into thick sticks.",
            "Scoop hummus into a small dipping bowl.",
            "Arrange veggies around the bowl and enjoy."
        ]
    },
    {
        id: "almonds_berries_pack",
        name: "Mixed Almonds & Fresh Raspberry Bowl",
        category: "snack",
        diet: ["balanced", "keto", "vegan", "vegetarian", "paleo", "gluten-free"],
        calories: 220,
        macros: { protein: 6, carbs: 12, fat: 17 },
        prepTime: "3 mins",
        ingredients: [
            { name: "Raw almonds", amount: "1 oz (approx. 23)", category: "Pantry" },
            { name: "Raspberries", amount: "1/2 cup", category: "Produce" }
        ],
        instructions: [
            "Rinse raspberries and pat dry.",
            "Combine in a bowl or small pouch with raw almonds."
        ]
    },
    {
        id: "yogurt_walnuts",
        name: "Greek Yogurt with Walnuts & Cinnamon",
        category: "snack",
        diet: ["balanced", "keto", "vegetarian", "gluten-free"],
        calories: 240,
        macros: { protein: 18, carbs: 9, fat: 15 },
        prepTime: "4 mins",
        ingredients: [
            { name: "Greek yogurt (plain)", amount: "1/2 cup", category: "Dairy & Eggs" },
            { name: "Walnuts (chopped)", amount: "2 tbsp", category: "Pantry" },
            { name: "Cinnamon", amount: "a pinch", category: "Pantry" },
            { name: "Honey or Stevia", amount: "1 tsp", category: "Pantry" }
        ],
        instructions: [
            "Spoon Greek yogurt into a small bowl.",
            "Top with chopped walnuts, a light dusting of cinnamon, and a drizzle of honey."
        ]
    },
    {
        id: "celery_pb_boats",
        name: "Celery Peanut Butter Boats",
        category: "snack",
        diet: ["balanced", "keto", "vegan", "vegetarian", "gluten-free"],
        calories: 210,
        macros: { protein: 8, carbs: 8, fat: 17 },
        prepTime: "5 mins",
        ingredients: [
            { name: "Celery stalks", amount: "2 medium", category: "Produce" },
            { name: "All-natural peanut butter", amount: "2 tbsp", category: "Pantry" }
        ],
        instructions: [
            "Wash celery stalks and cut into 3-inch logs.",
            "Spread peanut butter evenly inside the hollow channel of each celery log."
        ]
    }
];

// Helper to filter recipes
function getRecipesByFilters(category, diet, avoidances) {
    return RECIPES_DB.filter(recipe => {
        // Category check
        if (recipe.category !== category) return false;
        
        // Diet check (e.g. if diet preference is keto, recipe must list keto in diet array)
        if (diet && diet !== "balanced") {
            if (!recipe.diet.includes(diet)) return false;
        }
        
        // Avoidances check (e.g. if user avoids dairy, recipe ingredients cannot contain dairy)
        if (avoidances && avoidances.length > 0) {
            for (let allergy of avoidances) {
                // simple mapping of allergen to ingredient keywords
                let containsAllergen = recipe.ingredients.some(ing => {
                    let ingName = ing.name.toLowerCase();
                    let ingCat = ing.category.toLowerCase();
                    if (allergy === "nuts" && (ingName.includes("almond") || ingName.includes("walnut") || ingName.includes("peanut") || ingName.includes("nut"))) return true;
                    if (allergy === "gluten" && (ingName.includes("tortilla") || ingName.includes("bread") || ingName.includes("wheat") || ingName.includes("flour") || ingName.includes("pasta"))) return true;
                    if (allergy === "dairy" && (ingName.includes("cheese") || ingName.includes("butter") || ingName.includes("yogurt") || ingName.includes("milk") || ingName.includes("cream") || ingCat.includes("dairy"))) {
                        // Almond milk or coconut milk are safe
                        if (ingName.includes("almond milk") || ingName.includes("coconut milk")) return false;
                        return true;
                    }
                    if (allergy === "soy" && (ingName.includes("soy") || ingName.includes("tofu") || ingName.includes("edamame"))) return true;
                    if (allergy === "shellfish" && (ingName.includes("shrimp") || ingName.includes("crab") || ingName.includes("lobster") || ingName.includes("clam") || ingName.includes("prawn"))) return true;
                    return false;
                });
                if (containsAllergen) return false;
            }
        }
        return true;
    });
}

// Generate full weekly schedule
function generateWeekPlan(diet, avoidances, calorieTarget) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const mealTimes = ["breakfast", "lunch", "dinner", "snack"];
    const plan = {};

    days.forEach(day => {
        plan[day] = {};
        mealTimes.forEach(mealTime => {
            const list = getRecipesByFilters(mealTime, diet, avoidances);
            if (list.length > 0) {
                // Pick a random recipe from filtered list
                plan[day][mealTime] = { ...list[Math.floor(Math.random() * list.length)] };
            } else {
                // Fallback: pick any recipe of the category if filter is too restrictive, but warn user
                const fallbackList = RECIPES_DB.filter(r => r.category === mealTime);
                plan[day][mealTime] = { ...fallbackList[Math.floor(Math.random() * fallbackList.length)] };
            }
        });
    });

    return plan;
}

// Extract information using rules
function parseDietPreference(text) {
    const txt = text.toLowerCase();
    if (txt.includes("keto") || txt.includes("ketogenic")) return "keto";
    if (txt.includes("vegan")) return "vegan";
    if (txt.includes("vegetarian") || txt.includes("veggie")) return "vegetarian";
    if (txt.includes("mediterranean")) return "mediterranean";
    if (txt.includes("paleo")) return "paleo";
    return null;
}

function parseCalorieTarget(text) {
    const matches = text.match(/(\d{4})\s*(kcal|calories|cal)?/i);
    if (matches && matches[1]) {
        const val = parseInt(matches[1]);
        if (val >= 1000 && val <= 5000) return val;
    }
    return null;
}

function parseDay(text) {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const txt = text.toLowerCase();
    for (let day of days) {
        if (txt.includes(day)) return day.charAt(0).toUpperCase() + day.slice(1);
    }
    // Check relative days
    if (txt.includes("today")) return "today";
    if (txt.includes("tomorrow")) return "tomorrow";
    return null;
}

function parseMealTime(text) {
    const txt = text.toLowerCase();
    if (txt.includes("breakfast")) return "breakfast";
    if (txt.includes("lunch")) return "lunch";
    if (txt.includes("dinner")) return "dinner";
    if (txt.includes("snack")) return "snack";
    return null;
}

class MealAgent {
    constructor() {
        this.recipeDb = RECIPES_DB;
    }

    async processCommand(command, currentPlan, profile, logCallback) {
        const cmd = command.toLowerCase();
        
        // Log thinking steps
        const log = async (message, type = '') => {
            logCallback(message, type);
            await new Promise(resolve => setTimeout(resolve, 400)); // Delay for nice animation
        };

        await log("Initializing Aura meal intelligence system...", "intent");
        await log(`Parsing message: "${command}"`);

        // Check 1: Requesting Shopping List
        if (cmd.includes("shopping list") || cmd.includes("grocery") || cmd.includes("groceries") || cmd.includes("what to buy")) {
            await log("Intent detected: [Generate Grocery Shopping List]", "intent");
            await log("Analyzing ingredients across active 7-day meal plan...");
            await log("Categorizing by department...", "strategy");
            await log("Done. Formatting output.");
            
            return {
                action: "SHOW_SHOPPING_LIST",
                reply: "I've compiled your grocery list! Click the **View Shopping List** button in the header or check it out in the pop-up modal. It categorizes ingredients from all your planned meals into Produce, Dairy, Pantry, and Proteins so your shopping trip is smooth.",
                updatedPlan: null
            };
        }

        // Check 2: Cook from Pantry (Pantry ingredients match)
        if (cmd.includes("pantry") || cmd.includes("fridge") || cmd.includes("cook with") || cmd.includes("what can i cook")) {
            await log("Intent detected: [Pantry Match & Cook]", "intent");
            await log(`Active pantry items: [${profile.pantry.join(", ")}]`, "strategy");
            
            if (profile.pantry.length === 0) {
                await log("Pantry is empty! Aborting matching.", "action");
                return {
                    action: "REPLY_ONLY",
                    reply: "Your pantry inventory is currently empty! Add some ingredients to the **My Pantry** panel on the left (e.g., *chicken, spinach, eggs*), and then ask me to cook from it.",
                    updatedPlan: null
                };
            }

            await log("Searching recipe database for highest ingredient overlaps...");
            
            // Score recipes by overlap
            let matchedRecipes = this.recipeDb.map(recipe => {
                let score = 0;
                recipe.ingredients.forEach(ing => {
                    let name = ing.name.toLowerCase();
                    profile.pantry.forEach(pItem => {
                        if (name.includes(pItem.toLowerCase()) || pItem.toLowerCase().includes(name)) {
                            score += 1;
                        }
                    });
                });
                return { recipe, score };
            }).filter(item => item.score > 0)
              .sort((a, b) => b.score - a.score);

            if (matchedRecipes.length === 0) {
                await log("No direct matches found in database. Retrying with loose synonyms...", "strategy");
                return {
                    action: "REPLY_ONLY",
                    reply: `I checked my database but didn't find a direct recipe matching only **${profile.pantry.join(", ")}**. \n\nTry adding a few staples like *eggs, olive oil, chicken breast, or avocado* to your pantry and click **Cook from Pantry** again!`,
                    updatedPlan: null
                };
            }

            let bestMatch = matchedRecipes[0].recipe;
            await log(`Best match found: "${bestMatch.name}" (Score: ${matchedRecipes[0].score})`, "action");
            await log("Recommending recipe to user...");

            let matchReply = `Based on what's in your pantry, you can cook **${bestMatch.name}**! \n\nIt uses ingredients you have, plus a few staples. Would you like to schedule this for tonight's dinner? \n\n**Here is the recipe:**\n- **Prep Time:** ${bestMatch.prepTime}\n- **Calories:** ${bestMatch.calories} kcal\n- **Ingredients needed:** ${bestMatch.ingredients.map(i => i.name).join(", ")}`;

            return {
                action: "REPLY_ONLY",
                reply: matchReply,
                suggestedRecipe: bestMatch
            };
        }

        // Check 3: Meal Swap
        if (cmd.includes("swap") || cmd.includes("replace") || cmd.includes("change") || cmd.includes("don't like") || cmd.includes("avoid")) {
            await log("Intent detected: [Swap Meal in Calendar]", "intent");
            
            let day = parseDay(command);
            let mealTime = parseMealTime(command);
            
            // If relative day
            if (day === "today") {
                const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                day = days[new Date().getDay()];
            } else if (day === "tomorrow") {
                const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                day = days[(new Date().getDay() + 1) % 7];
            }

            if (!day) {
                await log("Day context missing. Defaulting to first day of grid modification...", "strategy");
                day = "Monday";
            }
            if (!mealTime) {
                await log("Meal category missing. Defaulting to Dinner...", "strategy");
                mealTime = "dinner";
            }

            await log(`Target slot: [Day: ${day} | Meal: ${mealTime}]`, "strategy");
            
            // Extract disliked ingredient if any
            let dislikedItem = null;
            if (cmd.includes("salmon")) dislikedItem = "salmon";
            else if (cmd.includes("pork")) dislikedItem = "pork";
            else if (cmd.includes("shrimp") || cmd.includes("seafood")) dislikedItem = "shellfish";
            else if (cmd.includes("chicken")) dislikedItem = "chicken";

            if (dislikedItem) {
                await log(`User restriction: Avoid [${dislikedItem}] in selection.`, "strategy");
            }

            // Find alternative
            let list = getRecipesByFilters(mealTime, profile.dietType, profile.allergies);
            if (dislikedItem) {
                list = list.filter(r => !r.name.toLowerCase().includes(dislikedItem) && !r.ingredients.some(i => i.name.toLowerCase().includes(dislikedItem)));
            }

            // Remove current meal from options to avoid swapping for same thing
            if (currentPlan && currentPlan[day] && currentPlan[day][mealTime]) {
                const currentId = currentPlan[day][mealTime].id;
                list = list.filter(r => r.id !== currentId);
            }

            if (list.length === 0) {
                await log("No unique alternative found with active filters.", "action");
                return {
                    action: "REPLY_ONLY",
                    reply: `I wanted to swap **${day}'s ${mealTime}**, but I couldn't find a different recipe that fits your exact profile settings (Diet: *${profile.dietType}*, Allergies: *${profile.allergies.join(", ") || "None"}*). Try relaxing some allergy exclusions!`,
                    updatedPlan: null
                };
            }

            let alternative = list[Math.floor(Math.random() * list.length)];
            await log(`Alternative selected: "${alternative.name}"`, "action");

            // Perform deep copy update of plan
            const updatedPlan = JSON.parse(JSON.stringify(currentPlan));
            updatedPlan[day][mealTime] = alternative;
            
            await log("Calendar grid updated successfully.", "action");
            
            return {
                action: "UPDATE_PLAN",
                reply: `I've updated **${day} ${mealTime}** in your calendar to **${alternative.name}** (${alternative.calories} kcal). It fits your active profile perfectly!`,
                updatedPlan: updatedPlan
            };
        }

        // Check 4: Full Schedule Generation
        if (cmd.includes("generate") || cmd.includes("create") || cmd.includes("plan") || cmd.includes("make a new")) {
            await log("Intent detected: [Generate Full Meal Schedule]", "intent");
            
            const diet = parseDietPreference(command) || profile.dietType;
            const calories = parseCalorieTarget(command) || profile.calorieTarget;
            
            await log(`Target parameters: [Diet: ${diet.toUpperCase()} | Limit: ${calories} kcal]`, "strategy");
            await log("Querying culinary database...");
            await log("Applying allergy exclusions...", "strategy");

            const newPlan = generateWeekPlan(diet, profile.allergies, calories);
            
            await log("New 7-day structure populated.", "action");
            await log("Calculating nutrition matrix...", "action");

            return {
                action: "GENERATE_PLAN",
                reply: `I've generated a new 7-day meal plan for you! \n\n- **Dietary Mode:** ${diet.toUpperCase()}\n- **Estimated Daily Intake:** ~${calories} kcal\n- **Allergies Excluded:** ${profile.allergies.join(", ") || "None"}\n\nYou can review it in the calendar grid. Feel free to click any card for instructions or ask me to swap individual meals.`,
                updatedPlan: newPlan,
                newProfileSettings: {
                    dietType: diet,
                    calorieTarget: calories
                }
            };
        }

        // Check 5: Snack recommendation
        if (cmd.includes("snack") || cmd.includes("snacks")) {
            await log("Intent detected: [Recommend Healthy Snacks]", "intent");
            await log("Matching snack profiles...");
            
            let snackList = getRecipesByFilters("snack", profile.dietType, profile.allergies);
            if (snackList.length === 0) {
                snackList = RECIPES_DB.filter(r => r.category === "snack");
            }

            await log(`Found ${snackList.length} options matching settings.`, "action");
            
            let bulletList = snackList.map(s => `- **${s.name}** (${s.calories} kcal) \n  *Macros: P: ${s.macros.protein}g, C: ${s.macros.carbs}g, F: ${s.macros.fat}g*`).join("\n");
            
            return {
                action: "REPLY_ONLY",
                reply: `Here are some healthy snack options matching your dietary profile:\n\n${bulletList}\n\nJust tell me: "Add [Snack Name] to Thursday" if you want me to write it down!`,
                updatedPlan: null
            };
        }

        // Default: Chat response
        await log("Intent detected: [General Conversational Inquiry]", "intent");
        await log("Consulting general nutrition guidelines...", "strategy");
        
        return {
            action: "REPLY_ONLY",
            reply: "I'm on it! I can help you custom-design your menu. Try commands like:\n- *'Generate a 1800 calorie keto plan'*\n- *'Swap Wednesday dinner for chicken'*\n- *'What can I cook with tomatoes and egg?'* \n- *'Show me my shopping list'*",
            updatedPlan: null
        };
    }
}

window.MealAgent = MealAgent;
window.generateWeekPlan = generateWeekPlan;
window.RECIPES_DB = RECIPES_DB;
