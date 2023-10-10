CREATE VIRTUAL TABLE food_search USING fts5(
    fdc_id,
    description, brand_name, brand_owner,
    serving_size, serving_size_unit,
    calories, protein, carbs, fat, fiber, sodium, sugar
);

INSERT INTO food_search (
    fdc_id, 
    description, brand_name, brand_owner,
    serving_size, serving_size_unit,
    calories, protein, carbs, fat, fiber, sodium, sugar
) SELECT
    fdc_id, 
    description, brand_name, brand_owner,
    serving_size, serving_size_unit,
    energy_amount as calories, protein_amount as protein, carb_amount as carbs, fat_amount as fat, fiber_amount as fiber, sodiumna_amount as sodium, sugarstotalincludingnlea_amount as sugar
FROM usda_branded_column;

INSERT INTO food_search (
    fdc_id, 
    description,
    serving_size, serving_size_unit,
    calories, protein, carbs, fat, fiber
) SELECT
    fdc_id, 
    description,
    serving_amount as serving_size, serving_text as serving_size_unit,
    energy_amount as calories, protein_amount as protein, carb_amount as carbs, fat_amount as fat, fiber_amount as fiber
FROM usda_non_branded_column;

INSERT INTO food_search (
    fdc_id, 
    description,
    serving_size_unit,
    calories, protein, carbs, fat, fiber, sodium, sugar
) SELECT
    FoodID as fdc_id, 
    description,
    serving_size as serving_size_unit,
    calories, protein, carbs, fat, fiber, sodium, sugar
FROM canfood;