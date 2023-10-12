DROP TABLE IF EXISTS food_search;

CREATE VIRTUAL TABLE food_search USING fts5(
    fdc_id,
    description, brand,
    serving_size, serving_size_unit,
    calories, protein, carbs, fat, fiber, sodium, sugar
);

INSERT INTO food_search (
    fdc_id, 
    description, brand,
    serving_size, serving_size_unit,
    calories, protein, carbs, fat, fiber, sodium, sugar
) SELECT
    fdc_id, 
    description,
    CASE
        WHEN brand_name IS NOT NULL AND brand_owner IS NOT NULL THEN brand_name || ' - ' || brand_owner
        WHEN brand_name IS NOT NULL THEN brand_name
        WHEN brand_owner IS NOT NULL THEN brand_owner
        ELSE NULL
    END AS brand,
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