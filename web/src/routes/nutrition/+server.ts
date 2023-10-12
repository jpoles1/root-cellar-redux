import { json } from '@sveltejs/kit';
import {nutritiondb} from '$lib/server/nutritiondb';
import type { Ingredient } from '$lib/root.js';


export async function POST({ request, cookies }) {
	const { ingredients } = await request.json();
	const nutrition = ingredients.map((ingredient: Ingredient) => {
		let clean_ingredient = ingredient.ingredient.replaceAll(/\(.*\)/g, '');
		//Split on " or " and only use the first part
		clean_ingredient = clean_ingredient.split(/ or /i)[0]
		//Remove all non-alphabetical characters
		clean_ingredient = clean_ingredient.replaceAll(/[^a-zA-Z ]/g, '');
		return nutritiondb.prepare(`
			SELECT DISTINCT * FROM (SELECT DISTINCT * FROM food_search WHERE food_search MATCH '${clean_ingredient}' AND calories IS NOT NULL ORDER BY rank, length(description) LIMIT 250) GROUP BY description ORDER BY length(description) LIMIT 50
		`).all();
	})
	const userid = cookies.get('userid');
	return json({ nutrition }, { status: 201 });
}
