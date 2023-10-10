import { json } from '@sveltejs/kit';
import {nutritiondb} from '$lib/server/nutritiondb';
import type { Ingredient } from '$lib/root.js';


export async function POST({ request, cookies }) {
	const { ingredients } = await request.json();
	const nutrition = ingredients.map((ingredient: Ingredient) => {
		const clean_ingredient = ingredient.ingredient.replaceAll(/\(.*\)/g, '');
		return nutritiondb().prepare(`
			SELECT DISTINCT * FROM (SELECT DISTINCT * FROM food_search WHERE food_search MATCH '${clean_ingredient} raw OR ${clean_ingredient}' ORDER BY rank LIMIT 50) GROUP BY description, brand_name, brand_owner ORDER BY length(brand_name), length(brand_owner), length(description) LIMIT 50
		`).all();
	})
	const userid = cookies.get('userid');
	return json({ nutrition }, { status: 201 });
}
