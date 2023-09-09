import { Recipe, recipe_from_google_recipe } from '$lib/root.js';
import { json } from '@sveltejs/kit';
import tsdom from 'tsdom';

const fetch_site_html = async (recipe_url: string) => {
    const resp = await fetch(recipe_url).then((resp) => {
        return resp.text()
    });
    const script_tags = extract_script_tags_regex(resp)
    return script_tags
}

const extract_script_tags_regex = (html: string) => {
    const script_regex = /<script.+?type=['"]application\/ld\+json['"].*?>([\s\S]*?)<\/script>/gi;
    const matches = [...html.matchAll(script_regex)].map((x) => x[1] || '').filter((x) => x != '');
    console.log(`Found ${matches.length} matches!`)
    return matches
}

export async function POST({ request, cookies }) {
    const { recipe_url } = await request.json();
    return json(await fetch_site_html(recipe_url))
}