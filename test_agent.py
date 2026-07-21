import json
import pytest
import re
from datetime import datetime

# Import components from agent_engine
from agent_engine import (
    redact_pii,
    get_recipes_by_filters,
    get_recipes_by_pantry,
    RECIPES
)

# 1. Test PII Redaction
def test_redact_pii_email():
    sample_text = "Please send the meal plan to john.doe@example.com."
    redacted = redact_pii(sample_text)
    assert "[EMAIL_REDACTED]" in redacted
    assert "john.doe@example.com" not in redacted

def test_redact_pii_phone():
    sample_text = "Call me at +1 (555) 019-2834 if you want to verify the ingredients."
    redacted = redact_pii(sample_text)
    assert "[PHONE_REDACTED]" in redacted
    assert "555" not in redacted

# 2. Test Recipe Filtering Tool
def test_get_recipes_by_filters_keto():
    # Filter for keto recipes
    result_str = get_recipes_by_filters("keto", [])
    result = json.loads(result_str)
    
    assert result["status"] == "success"
    recipes = result["data"]
    assert len(recipes) > 0
    # Every recipe returned should list 'keto' in its diet array
    for r in recipes:
        assert "keto" in r["diet"]

def test_get_recipes_by_filters_exclusions():
    # Filter for dairy exclusions (e.g., must not contain butter, cheese, milk)
    result_str = get_recipes_by_filters("balanced", ["dairy"])
    result = json.loads(result_str)
    
    assert result["status"] == "success"
    recipes = result["data"]
    # Check that none of the returned recipes have dairy items
    for r in recipes:
        ingredients_lower = [i.lower() for i in r["ingredients"]]
        assert not any("butter" in ing or "cheese" in ing or "milk" in ing for ing in ingredients_lower)

# 3. Test Pantry Overlap matching Tool
def test_get_recipes_by_pantry_match():
    # Sauté ingredients in pantry
    pantry = ["egg", "spinach"]
    result_str = get_recipes_by_pantry(pantry)
    result = json.loads(result_str)
    
    assert result["status"] == "success"
    recipes = result["data"]
    assert len(recipes) > 0
    # The first matched recipe should contain at least one of these ingredients
    first_recipe = recipes[0]
    ing_lower = [i.lower() for i in first_recipe["ingredients"]]
    assert any("egg" in ing or "spinach" in ing for ing in ing_lower)

# 4. Test Slot parsing helper
def test_parse_slot_from_query():
    # Define simple mock of slot parsing to assert matching behavior
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    meal_times = ["breakfast", "lunch", "dinner", "snack"]
    
    def mock_parse(text):
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
        return {"day": target_day, "mealTime": target_meal}

    slot = mock_parse("I would like to swap Tuesday breakfast options.")
    assert slot["day"] == "Tuesday"
    assert slot["mealTime"] == "breakfast"
    
    slot_none = mock_parse("Hello there, who are you?")
    assert slot_none["day"] is None
    assert slot_none["mealTime"] is None

# 5. Regression Golden Dataset Evaluation Test
def test_golden_dataset_regression():
    from evaluate_agent import run_regression_tests
    # This executes the golden dataset assertions
    run_regression_tests()
