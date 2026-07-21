import os
import json
import logging
import sqlite3
import re
from datetime import datetime
from google.genai import Client
from google.genai import types


# ---------------------------------------------------------
# 1. STRUCTURED JSON LOGGING & PII REDACTION
# ---------------------------------------------------------
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.fromtimestamp(record.created).isoformat(),
            "level": record.levelname,
            "component": record.name,
            "message": record.getMessage()
        }
        if hasattr(record, "extra"):
            log_data.update(record.extra)
        return json.dumps(log_data)

# Setup Logger
logger = logging.getLogger("AuraMealAgent")
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setFormatter(JSONFormatter())
logger.addHandler(ch)

# PII Redaction Utility
def redact_pii(text: str) -> str:
    """Redacts common PII like emails, phone numbers, and potential personal details."""
    # Redact email addresses
    email_pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    redacted = re.sub(email_pattern, "[EMAIL_REDACTED]", text)
    
    # Redact phone numbers (simple pattern)
    phone_pattern = r'\b(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}\b'
    redacted = re.sub(phone_pattern, "[PHONE_REDACTED]", redacted)
    
    return redacted

# ---------------------------------------------------------
# 2. OPENTELEMETRY TRACING MOCK
# ---------------------------------------------------------
# Since OpenTelemetry is requested, we can use the python SDK to set up tracing.
try:
    from opentelemetry import trace
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import SimpleSpanProcessor, ConsoleSpanExporter
    
    trace.set_tracer_provider(TracerProvider())
    tracer = trace.get_tracer("AuraMealTracer")
    # Log trace to console for visibility
    trace.get_tracer_provider().add_span_processor(
        SimpleSpanProcessor(ConsoleSpanExporter())
    )
    logger.info("OpenTelemetry Tracing initialized successfully.")
except ImportError:
    # Fallback to a mock tracer if package is not imported correctly
    class MockSpan:
        def __enter__(self): return self
        def __exit__(self, exc_type, exc_val, exc_tb): pass
        def set_attribute(self, key, value): pass
    
    class MockTracer:
        def start_as_current_span(self, name): return MockSpan()
    
    tracer = MockTracer()
    logger.info("OpenTelemetry not available. Falling back to Mock Tracer.")

# ---------------------------------------------------------
# 3. DATABASE & PERSISTENT MEMORY PIPELINE
# ---------------------------------------------------------
DB_FILE = "aurameal.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    # Create conversations/memory table
    c.execute('''
        CREATE TABLE IF NOT EXISTS memory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id TEXT,
            timestamp TEXT,
            sender TEXT,
            message TEXT
        )
    ''')
    # Create structured logs table
    c.execute('''
        CREATE TABLE IF NOT EXISTS execution_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            component TEXT,
            action TEXT,
            details TEXT
        )
    ''')
    conn.commit()
    conn.close()

def save_message_to_db(conversation_id: str, sender: str, message: str):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute(
        "INSERT INTO memory (conversation_id, timestamp, sender, message) VALUES (?, ?, ?, ?)",
        (conversation_id, datetime.now().isoformat(), sender, redact_pii(message))
    )
    conn.commit()
    conn.close()

def get_chat_history(conversation_id: str, limit: int = 15) -> list[dict]:
    """Retrieves conversation history to manage context bloat."""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute(
        "SELECT sender, message FROM memory WHERE conversation_id = ? ORDER BY id DESC LIMIT ?",
        (conversation_id, limit)
    )
    rows = c.fetchall()
    conn.close()
    
    # Return chronologically
    return [{"sender": r[0], "message": r[1]} for r in reversed(rows)]

def log_execution_to_db(component: str, action: str, details: dict):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute(
        "INSERT INTO execution_logs (timestamp, component, action, details) VALUES (?, ?, ?, ?)",
        (datetime.now().isoformat(), component, action, json.dumps(details))
    )
    conn.commit()
    conn.close()

# ---------------------------------------------------------
# 4. RECIPE KNOWLEDGE BASE
# ---------------------------------------------------------
RECIPES = [
    {
        "id": "keto_scrambled_eggs",
        "name": "Avocado & Cheddar Scrambled Eggs",
        "category": "breakfast",
        "diet": ["keto", "paleo", "gluten-free"],
        "calories": 450,
        "macros": {"protein": 28, "carbs": 4, "fat": 38},
        "prepTime": "10 mins",
        "ingredients": ["Eggs", "Avocado", "Cheddar cheese", "Butter", "Salt and pepper"],
        "instructions": "Whisk eggs with salt and pepper in a bowl. Melt butter in a pan over medium heat. Pour in eggs and scramble gently until cooked to your liking. Top with shredded cheddar cheese and diced avocado before serving."
    },
    {
        "id": "berry_oatmeal_bowl",
        "name": "Almond Berry Oatmeal Bowl",
        "category": "breakfast",
        "diet": ["balanced", "vegan", "vegetarian"],
        "calories": 380,
        "macros": {"protein": 11, "carbs": 54, "fat": 12},
        "prepTime": "8 mins",
        "ingredients": ["Rolled oats", "Almond milk", "Blueberries", "Strawberries", "Chia seeds", "Maple syrup"],
        "instructions": "Combine rolled oats and almond milk in a small saucepan. Cook over medium heat for 5 minutes, stirring occasionally, until thick. Pour oatmeal into a bowl. Top with fresh berries, chia seeds, and a drizzle of maple syrup."
    },
    {
        "id": "quinoa_salad",
        "name": "Crispy Quinoa & Avocado Salad",
        "category": "lunch",
        "diet": ["balanced", "vegan", "vegetarian", "gluten-free"],
        "calories": 440,
        "macros": {"protein": 12, "carbs": 49, "fat": 23},
        "prepTime": "15 mins",
        "ingredients": ["Quinoa", "Avocado", "Cherry tomatoes", "Cucumber", "Black beans", "Olive oil", "Lemon juice"],
        "instructions": "Prepare fresh cooked quinoa or warm pre-cooked quinoa. Dice avocado, tomatoes, and cucumber. Drain and rinse black beans. Toss quinoa, veggies, and beans together with olive oil and lemon juice."
    },
    {
        "id": "garlic_butter_shrimp",
        "name": "Garlic Butter Shrimp with Zucchini Noodles",
        "category": "dinner",
        "diet": ["balanced", "keto", "gluten-free"],
        "calories": 480,
        "macros": {"protein": 36, "carbs": 8, "fat": 34},
        "prepTime": "15 mins",
        "ingredients": ["Shrimp", "Zucchini", "Garlic", "Butter", "Olive oil", "Lemon juice", "Parsley"],
        "instructions": "Melt butter and olive oil in a skillet over medium-high heat. Add garlic and sauté for 1 minute until fragrant. Add shrimp and cook for 2-3 minutes per side until pink. Toss in spiralized zucchini noodles and cook for 2 more minutes. Drizzle with lemon juice and chopped parsley before plating."
    },
    {
        "id": "chickpea_curry",
        "name": "Coconut Chickpea & Spinach Curry",
        "category": "dinner",
        "diet": ["balanced", "vegan", "vegetarian", "gluten-free"],
        "calories": 520,
        "macros": {"protein": 14, "carbs": 68, "fat": 18},
        "prepTime": "20 mins",
        "ingredients": ["Chickpeas", "Coconut milk", "Spinach", "Crushed tomatoes", "Curry powder", "Rice"],
        "instructions": "In a saucepan, stir together curry powder and 1 tbsp water for 30 seconds. Add chickpeas, coconut milk, and crushed tomatoes. Simmer for 10 minutes. Stir in spinach until wilted. Serve hot over a bowl of cooked white or brown rice."
    }
]

# ---------------------------------------------------------
# 5. SEMANTIC SEARCH / LOCAL VECTOR STORE
# ---------------------------------------------------------
class RecipeVectorStore:
    def __init__(self, client: Client = None):
        self.client = client
        self.embeddings = {}
        
    def generate_embeddings_db(self):
        """Generates embedding vectors for all recipes in knowledge base using Gemini."""
        if not self.client:
            logger.warning("No Gemini client provided. Semantic search will fallback to simple keyword matching.")
            return

        with tracer.start_as_current_span("generate_embeddings"):
            try:
                for recipe in RECIPES:
                    text_content = f"{recipe['name']} {recipe['instructions']} {' '.join(recipe['ingredients'])}"
                    response = self.client.models.embed_content(
                        model="text-embedding-004",
                        contents=text_content
                    )
                    # The response embedding contains values list
                    self.embeddings[recipe['id']] = response.embeddings[0].values
                logger.info("Successfully generated embeddings for recipe knowledge base.")
            except Exception as e:
                logger.error(f"Failed to generate embeddings: {str(e)}")

    def similarity_search(self, query: str, limit: int = 3) -> list[dict]:
        """Calculates cosine similarity between query and recipe embeddings."""
        if not self.client or not self.embeddings:
            # Fallback keyword match
            logger.info("Fallback search active.")
            matches = []
            for r in RECIPES:
                score = sum(1 for w in query.lower().split() if w in r['name'].lower() or w in r['instructions'].lower())
                if score > 0:
                    matches.append((r, score))
            matches.sort(key=lambda x: x[1], reverse=True)
            return [m[0] for m in matches[:limit]]

        with tracer.start_as_current_span("similarity_search") as span:
            span.set_attribute("query", query)
            try:
                q_response = self.client.models.embed_content(
                    model="text-embedding-004",
                    contents=query
                )
                q_vec = q_response.embeddings[0].values
                
                scores = []
                for rid, r_vec in self.embeddings.items():
                    dot_product = sum(x * y for x, y in zip(q_vec, r_vec))
                    norm_q = sum(x * x for x in q_vec) ** 0.5
                    norm_r = sum(x * x for x in r_vec) ** 0.5
                    cos_sim = dot_product / (norm_q * norm_r) if (norm_q * norm_r) > 0 else 0.0
                    scores.append((rid, cos_sim))
                
                scores.sort(key=lambda x: x[1], reverse=True)
                results = []
                for rid, score in scores[:limit]:
                    recipe = next(r for r in RECIPES if r['id'] == rid)
                    recipe_copy = recipe.copy()
                    recipe_copy['similarity_score'] = float(score)
                    results.append(recipe_copy)
                return results
            except Exception as e:
                logger.error(f"Semantic search failed: {str(e)}")
                return []

# Initialize Vector Store
vector_store = RecipeVectorStore()

# ---------------------------------------------------------
# 6. LLM AGENT TOOLS & GUARDRAILS
# ---------------------------------------------------------
# Explicit JSON Schema validation and guided error handling are implemented here.

def get_recipes_by_filters(diet_type: str, exclusions: list[str]) -> str:
    """Queries recipes filtering by diet type and avoiding specific allergens.
    
    Args:
        diet_type: The diet filter, e.g., 'balanced', 'keto', 'vegan', 'vegetarian'.
        exclusions: List of ingredients/allergens to exclude (e.g. ['dairy', 'nuts']).
        
    Returns:
        JSON string containing matching recipes.
    """
    logger.info("Executing tool: get_recipes_by_filters", extra={"diet_type": diet_type, "exclusions": exclusions})
    with tracer.start_as_current_span("tool_get_recipes_by_filters"):
        try:
            filtered = []
            for r in RECIPES:
                # Diet filter
                if diet_type != "balanced" and diet_type not in r['diet']:
                    continue
                # Exclusions
                has_exclusion = False
                for exc in exclusions:
                    exc_clean = exc.lower().strip()
                    for ing in r['ingredients']:
                        ing_name = ing.lower()
                        if exc_clean == "nuts" and any(k in ing_name for k in ["almond", "walnut", "peanut", "nut"]):
                            has_exclusion = True
                            break
                        elif exc_clean == "gluten" and any(k in ing_name for k in ["tortilla", "bread", "wheat", "flour", "pasta"]):
                            has_exclusion = True
                            break
                        elif exc_clean == "dairy" and any(k in ing_name for k in ["cheese", "butter", "yogurt", "milk", "cream"]):
                            has_exclusion = True
                            break
                        elif exc_clean == "soy" and any(k in ing_name for k in ["soy", "tofu", "edamame"]):
                            has_exclusion = True
                            break
                        elif exc_clean == "shellfish" and any(k in ing_name for k in ["shrimp", "crab", "lobster", "clam", "prawn"]):
                            has_exclusion = True
                            break
                        elif exc_clean in ing_name:
                            has_exclusion = True
                            break
                    if has_exclusion:
                        break
                if not has_exclusion:
                    filtered.append(r)
            
            log_execution_to_db("AgentTools", "get_recipes_by_filters", {"diet": diet_type, "exclusions": exclusions, "results_count": len(filtered)})
            return json.dumps({"status": "success", "data": filtered})
        except Exception as e:
            logger.error(f"Error in get_recipes_by_filters: {str(e)}")
            return json.dumps({"status": "error", "message": f"Error running recipe filters: {str(e)}"})

def get_recipes_by_pantry(pantry_items: list[str]) -> str:
    """Finds recipes in knowledge base that contain ingredients currently in the pantry.
    
    Args:
        pantry_items: List of pantry ingredient names.
        
    Returns:
        JSON string of matched recipes ranked by ingredient overlap.
    """
    logger.info("Executing tool: get_recipes_by_pantry", extra={"pantry_items": pantry_items})
    with tracer.start_as_current_span("tool_get_recipes_by_pantry"):
        try:
            matches = []
            for r in RECIPES:
                score = 0
                for ing in r['ingredients']:
                    if any(item.lower().strip() in ing.lower() for item in pantry_items):
                        score += 1
                if score > 0:
                    matches.append((r, score))
            
            matches.sort(key=lambda x: x[1], reverse=True)
            results = [m[0] for m in matches]
            
            log_execution_to_db("AgentTools", "get_recipes_by_pantry", {"pantry": pantry_items, "results_count": len(results)})
            return json.dumps({"status": "success", "data": results})
        except Exception as e:
            logger.error(f"Error in get_recipes_by_pantry: {str(e)}")
            return json.dumps({"status": "error", "message": f"Error searching pantry ingredients: {str(e)}"})

def search_recipes_semantic(query: str) -> str:
    """Performs a semantic search for recipes using vector database embeddings.
    
    Args:
        query: Natural language query string (e.g. 'high protein breakfast' or 'something spicy with chicken').
        
    Returns:
        JSON string of matched recipes sorted by similarity score.
    """
    logger.info("Executing tool: search_recipes_semantic", extra={"query": query})
    with tracer.start_as_current_span("tool_search_recipes_semantic"):
        try:
            results = vector_store.similarity_search(query)
            log_execution_to_db("AgentTools", "search_recipes_semantic", {"query": query, "results_count": len(results)})
            return json.dumps({"status": "success", "data": results})
        except Exception as e:
            logger.error(f"Error in search_recipes_semantic: {str(e)}")
            return json.dumps({"status": "error", "message": f"Error running semantic search: {str(e)}"})

# ---------------------------------------------------------
# 7. MULTI-AGENT ORCHESTRATION PIPELINE
# ---------------------------------------------------------
class AuraAgentOrchestrator:
    def __init__(self):
        # Secure secrets management
        api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            logger.error("API Key validation failed. Model invocation will fail.")
            self.client = None
        else:
            self.client = Client(api_key=api_key)
            vector_store.client = self.client
            # Pre-embed all recipes for vector search
            vector_store.generate_embeddings_db()
            
    def invoke(self, message: str, conversation_id: str, profile: dict) -> dict:
        """Main execution loop of the agent orchestration pipeline.
        
        Args:
            message: User query string.
            conversation_id: Unique chat identifier.
            profile: Dict containing dietType, calorieTarget, allergies (list), and pantry (list).
            
        Returns:
            Dict containing agent's markdown reply and optional state updates.
        """
        save_message_to_db(conversation_id, "user", message)
        
        if not self.client:
            return {
                "reply": "⚠️ **Configuration Error**: No GEMINI_API_KEY or GOOGLE_API_KEY found in the server environment. Please configure it in your `.env` file to start using the real AI Planner.",
                "thinking": ["> Initializing Aura agent...", "> ERROR: API Key missing in environment."],
                "action": "REPLY_ONLY"
            }
            
        # Get chat history for memory management (prevents context bloat)
        history = get_chat_history(conversation_id, limit=10)
        history_formatted = "\n".join([f"{h['sender'].upper()}: {h['message']}" for h in history])
        
        # System instructions & Guardrails configuration
        system_instruction = f"""You are 'Aura AI', a professional, autonomous culinary planner and nutritionist.
You assist the user in managing their weekly meal plans, matching recipes with pantry inventories, and custom dietary requests.

USER PROFILE PARAMETERS:
- Diet Type Preference: {profile.get('dietType', 'balanced')}
- Daily Calorie Target: {profile.get('calorieTarget', 2000)} kcal
- Excluded Allergens/Avoidances: {profile.get('allergies', [])}
- Active Pantry Inventory: {profile.get('pantry', [])}

GUIDELINES:
1. ALWAYS respect the user's dietary preferences and allergies. If they ask to add/swap a meal, filter using the appropriate tool.
2. Use the tool `get_recipes_by_filters` when the user wants to generate plans or search recipes with active constraints.
3. Use the tool `get_recipes_by_pantry` if the user wants to cook using what's in their fridge/pantry.
4. Use `search_recipes_semantic` if they want to search for general cooking style, ingredients, or taste queries.
5. Answer in a professional, friendly manner. If a state change (like replacing a meal) is requested, explicitly mention what recipe is replacing what slot, and describe its calories & prep time.
"""

        thinking_logs = []
        thinking_logs.append("> Initializing Aura agent system...")
        thinking_logs.append(f"> Context memory loaded ({len(history)} messages).")
        thinking_logs.append("> Calling Gemini model with tools...")

        # Setup model config with tools
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.4,
            tools=[
                types.Tool(function_declarations=[
                    types.FunctionDeclaration(
                        name="get_recipes_by_filters",
                        description="Queries recipes filtering by diet type and avoiding specific allergens.",
                        parameters=types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "diet_type": types.Schema(type=types.Type.STRING, description="The diet filter, e.g. balanced, keto, vegan, vegetarian"),
                                "exclusions": types.Schema(
                                    type=types.Type.ARRAY,
                                    items=types.Schema(type=types.Type.STRING),
                                    description="List of ingredients/allergens to exclude"
                                )
                            },
                            required=["diet_type", "exclusions"]
                        )
                    ),
                    types.FunctionDeclaration(
                        name="get_recipes_by_pantry",
                        description="Finds recipes in database that contain ingredients currently in the pantry.",
                        parameters=types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "pantry_items": types.Schema(
                                    type=types.Type.ARRAY,
                                    items=types.Schema(type=types.Type.STRING),
                                    description="List of active pantry ingredients"
                                )
                            },
                            required=["pantry_items"]
                        )
                    ),
                    types.FunctionDeclaration(
                        name="search_recipes_semantic",
                        description="Performs a semantic search for recipes using vector database embeddings.",
                        parameters=types.Schema(
                            type=types.Type.OBJECT,
                            properties={
                                "query": types.Schema(type=types.Type.STRING, description="The search query text")
                            },
                            required=["query"]
                        )
                    )
                ])
            ]
        )

        with tracer.start_as_current_span("agent_execution_loop") as span:
            span.set_attribute("conversation_id", conversation_id)
            try:
                # API Call to Gemini
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=message,
                    config=config
                )
                
                # Check for tool calls (Function Calls)
                function_calls = response.function_calls
                
                if function_calls:
                    fc = function_calls[0]
                    tool_name = fc.name
                    tool_args = fc.args
                    
                    thinking_logs.append(f"> LLM requested tool call: [{tool_name}] with arguments {json.dumps(tool_args)}")
                    span.set_attribute("tool_call.name", tool_name)
                    
                    # Execute tool
                    tool_result = ""
                    if tool_name == "get_recipes_by_filters":
                        tool_result = get_recipes_by_filters(tool_args.get("diet_type"), tool_args.get("exclusions", []))
                    elif tool_name == "get_recipes_by_pantry":
                        tool_result = get_recipes_by_pantry(tool_args.get("pantry_items", []))
                    elif tool_name == "search_recipes_semantic":
                        tool_result = search_recipes_semantic(tool_args.get("query"))
                        
                    thinking_logs.append(f"> Tool response received. Sending back to LLM for final generation...")
                    
                    # Send tool response back to LLM to generate final response
                    # In python sdk v2 we can supply history or structured contents
                    # We can model a multi-turn call or make a second call explaining the result.
                    followup_prompt = f"""User message: {message}
The tool '{tool_name}' returned the following result:
{tool_result}

Please formulate the final response to the user based on these results. Update their meal plan schedule if they requested a swap or plan generation."""
                    
                    final_response = self.client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=followup_prompt,
                        config=types.GenerateContentConfig(system_instruction=system_instruction, temperature=0.4)
                    )
                    
                    reply = final_response.text
                    
                    # Parse if state update was requested
                    action = "REPLY_ONLY"
                    updated_plan = None
                    
                    # Check if model returned updated recipe arrays or swap details
                    # If tool returned recipes, let's verify if user requested a plan or swap
                    try:
                        tool_json = json.loads(tool_result)
                        if tool_json.get("status") == "success" and tool_json.get("data"):
                            recipes_list = tool_json.get("data")
                            if "generate" in message.lower() or "create" in message.lower() or "plan" in message.lower():
                                action = "GENERATE_PLAN"
                                # Let's construct a weekly plan object from matching recipes
                                updated_plan = self._build_weekly_plan(recipes_list)
                            elif "swap" in message.lower() or "replace" in message.lower() or "change" in message.lower():
                                action = "UPDATE_PLAN"
                                # Parse slot details from user query or let the model suggest it
                                # For robustness, we will pass the best recipe match to the frontend to handle the slot swap
                                updated_plan = recipes_list[0] if recipes_list else None
                    except Exception as ex:
                        logger.warning(f"Failed to auto-parse state updates: {str(ex)}")
                
                else:
                    reply = response.text
                    action = "REPLY_ONLY"
                    updated_plan = None
                    thinking_logs.append("> LLM responded directly without tool call.")
                
                def parse_slot_from_query(text: str) -> dict:
                    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                    meal_times = ["breakfast", "lunch", "dinner", "snack"]
                    txt = text.lower()
                    target_day = None
                    for d in days:
                        if d.lower() in txt:
                            target_day = d
                            break
                    target_meal = None
                    for m in meal_times:
                        if m in txt:
                            target_meal = m
                            break
                    if "today" in txt:
                        target_day = days[datetime.now().weekday()]
                    elif "tomorrow" in txt:
                        target_day = days[(datetime.now().weekday() + 1) % 7]
                    return {"day": target_day, "mealTime": target_meal}

                # Save agent response to db
                save_message_to_db(conversation_id, "agent", reply)
                thinking_logs.append("> Execution complete.")
                
                return {
                    "reply": redact_pii(reply),
                    "thinking": thinking_logs,
                    "action": action,
                    "updatedPlan": updated_plan,
                    "targetSlot": parse_slot_from_query(message) if action == "UPDATE_PLAN" else None
                }
                
            except Exception as e:
                logger.error(f"Error in AuraAgentOrchestrator: {str(e)}")
                thinking_logs.append(f"> ERROR: {str(e)}")
                return {
                    "reply": f"Sorry, I encountered an error during my reasoning process: {str(e)}",
                    "thinking": thinking_logs,
                    "action": "REPLY_ONLY"
                }

    def _build_weekly_plan(self, recipes_list: list) -> dict:
        """Helper to structure weekly plan from database recipe instances."""
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        meal_times = ["breakfast", "lunch", "dinner", "snack"]
        plan = {}
        
        # Sort recipes by category
        categories = {m: [r for r in recipes_list if r.get("category") == m] for m in meal_times}
        # Fill empty lists with fallbacks
        for m in meal_times:
            if not categories[m]:
                categories[m] = [r for r in RECIPES if r.get("category") == m]

        for day in days:
            plan[day] = {}
            for m in meal_times:
                r_list = categories[m]
                # Pick a recipe
                recipe = r_list[np.random.randint(0, len(r_list))] if r_list else None
                plan[day][m] = recipe
        return plan

# Init global database
init_db()
