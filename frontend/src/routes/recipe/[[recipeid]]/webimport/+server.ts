import { json } from '@sveltejs/kit';

const fetch_site_html = async (recipe_url: string) => {
const resp = await fetch(recipe_url).then((resp) => {
        return resp.text()
    });
    const script_tags = extract_script_tags_regex(resp)
    return script_tags
}

const extract_script_tags_regex = (html: string) => {
    // This code is used to find the JSON-LD scripts on a page.
    // It will return an array of strings, each string containing
    // the text of a single JSON-LD script found on the page.
    const script_regex = /<script.+?type=['"]application\/ld\+json['"].*?>([\s\S]*?)<\/script>/gi;
    const matches = [...html.matchAll(script_regex)].map((x) => x[1] || '').filter((x) => x != '');
    console.log(`Found ${matches.length} matches!`)
    return matches
}

export async function POST({ request }) {
    const { recipe_url } = await request.json();
    return json(await fetch_site_html(recipe_url))
}