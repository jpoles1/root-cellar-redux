CREATE VIEW canfood AS
SELECT 
	FoodID, description, serving_size,
	avg(NutrientValue) filter(where NutrientName = "ENERGY (KILOCALORIES)") calories,
	avg(NutrientValue) filter(where NutrientName = "FAT (TOTAL LIPIDS)") fat,
	avg(NutrientValue) filter(where NutrientName = "CARBOHYDRATE, TOTAL (BY DIFFERENCE)") carbs,
	avg(NutrientValue) filter(where NutrientName = "PROTEIN") protein,
	avg(NutrientValue) filter(where NutrientName = "FIBRE, TOTAL DIETARY") fiber,
	avg(NutrientValue) filter(where NutrientName = "SUGARS, TOTAL") sugar,
	avg(NutrientValue) filter(where NutrientName = "SODIUM") sodium
FROM
	(SELECT
		food_name.FoodID, food_name.FoodDescription as description, serving_size, 
		nutrient_amount.NutrientName, nutrient_amount.NutrientValue
	FROM (
		SELECT * FROM food_name LEFT JOIN (
			SELECT conversion_factor.FoodID, measure_name.MeasureDescription as serving_size FROM conversion_factor LEFT JOIN measure_name ON conversion_factor.MeasureID = measure_name.MeasureID
		) as serving ON food_name.FoodID = serving.FoodID
	) as food_name
	INNER JOIN (
		SELECT nutrient_amount.FoodID, nutrient_amount.NutrientValue, nutrient_name.NutrientName FROM nutrient_amount INNER JOIN nutrient_name ON nutrient_amount.NutrientID = nutrient_name.NutrientID
	) as nutrient_amount 
	ON food_name.FoodID = nutrient_amount.FoodID) as nutr
GROUP BY FoodID
