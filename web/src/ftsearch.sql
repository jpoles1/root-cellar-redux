CREATE VIRTUAL TABLE food_search USING fts5(
    fdc_id,
    description, brand_name, brand_owner,
    serving_size, serving_size_unit,
    protein_unit, carb_unit, fat_unit, energy_unit, fiber_unit, sodiumna_unit, sugarstotal_unit,
    protein_amount, carb_amount, fat_amount, energy_amount, fiber_amount, sodiumna_amount, sugarstotal_amount
);

INSERT INTO food_search (
    fdc_id, 
    description, brand_name, brand_owner,
    serving_size, serving_size_unit,
    protein_unit, carb_unit, fat_unit, energy_unit, fiber_unit, sodiumna_unit, sugarstotal_unit,
    protein_amount, carb_amount, fat_amount, energy_amount, fiber_amount, sodiumna_amount, sugarstotal_amount
) SELECT
    fdc_id, 
    description, brand_name, brand_owner,
    serving_size, serving_size_unit,
    protein_unit, carb_unit, fat_unit, energy_unit, fiber_unit, sodiumna_unit, sugarstotalincludingnlea_unit as sugarstotal_unit,
    protein_amount, carb_amount, fat_amount, energy_amount, fiber_amount, sodiumna_amount, sugarstotalincludingnlea_amount as sugarstotal_amount
FROM usda_branded_column;

INSERT INTO food_search (
    fdc_id, 
    description,
    serving_size, serving_size_unit,
    protein_unit, carb_unit, fat_unit, energy_unit, fiber_unit,
    protein_amount, carb_amount, fat_amount, energy_amount, fiber_amount 
) SELECT
    fdc_id, 
    description,
    serving_amount as serving_size, serving_text as serving_size_unit,
    protein_unit, carb_unit, fat_unit, energy_unit, fiber_unit,
    protein_amount, carb_amount, fat_amount, energy_amount, fiber_amount
FROM usda_non_branded_column;