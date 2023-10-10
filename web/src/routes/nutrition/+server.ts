import { json } from '@sveltejs/kit';
import {nutritiondb} from '$lib/server/nutritiondb';
import type { Ingredient } from '$lib/root.js';


export async function POST({ request, cookies }) {
	const { ingredients } = await request.json();
	const nutrition = ingredients.map((ingredient: Ingredient) => {
		return nutritiondb().prepare(
			`SELECT * FROM usda_branded_column RIGHT JOIN 
			(SELECT fdc_id FROM food_search WHERE description MATCH '${ingredient.ingredient}' ORDER BY rank LIMIT 15) as matches 
			ON usda_branded_column.fdc_id = matches.fdc_id 
			WHERE protein_amount IS NOT NULL AND carb_amount IS NOT NULL AND fat_amount IS NOT NULL AND energy_amount IS NOT NULL
			ORDER BY length(description) 
			LIMIT 10
		`).all();
	})
	const userid = cookies.get('userid');
	return json({ nutrition }, { status: 201 });
}
