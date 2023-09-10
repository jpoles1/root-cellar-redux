import * as iparser from "$lib/ingredient-parser"
import type { GoogleRecipeSchema } from "./GoogleRecipeSchema"

export type Picture = string[]

export class Ingredient {
	quantity = 0
    unit = ""
    ingredient = ""
    notes = ""
    
    constructor(data?: Partial<Ingredient>) {
        Object.assign(this, data)
    }
}

//Instruction stores data for a step in the recipe
export class Instruction {
	instruction = ""
    duration?: number
    optional = false 
    
    constructor(data?: Partial<Instruction>) {
        Object.assign(this, data)
    }
}

export class RecipeRating {
    rid: string //recipe id
    rating: number //1-5 scale
    comments?: string
    pics?: Picture[]

    constructor(rid: string, rating: number, data?: Partial<RecipeRating>) {
        this.rid = rid
        this.rating = rating
        Object.assign(this, data)
    }
}

export const txt_to_ingredients = (txt: string): Ingredient[] => {
    const ingredient_list = txt
        .split("\n")
        .map(x => x.trim().replaceAll("of ", ""))
        .filter(x => x.length > 0)
        .map((x) => x.replace(/, (.*)$/, "($1)")) // Takes words after commas at end of ingredient and puts them into parenthesis to turn them into notes
        .map(x => iparser.parse(x) as Ingredient)
    return ingredient_list
}

export const txt_to_instructions = (txt: string): Instruction[] => {
    const instruction_list = txt
        .split(/(?:[\n\t\r]| {3,})+/)
        .map(x => x.trim())
        .filter(x => x.length > 0)
        .map(
            (instruction) => {
                let optional = false
                instruction = instruction.replace(/^\d[).]\w*/, "")
                if (instruction.match(/\(Optional\)/g)) {
                    optional = true
                }
                instruction = instruction.replace(/\(Optional\)/g, "")
                instruction = instruction.trim()
                return ({
                    instruction,
                    optional,
                } as Instruction)
            }
        )
    return instruction_list
}

//Recipe contains data regarding a recipe for a certain dish
export class Recipe {
	id = ""
    uid?: string
    title = "Unnamed Recipe"
    description = ""
    ingredients: Ingredient[] = []
    instructions: Instruction[] = []
    servings?: number = 0
	active_time?: number = 0
	total_time?: number = 0	
	archived = false
    og_id = ""
    og_url = ""
    version = 1
    tags: string[] = []
    pics?: any
    pic_urls: string[] = []
    created: number = Date.now()
    last_updated: number = Date.now()

    constructor(data?: Partial<Recipe>) {
        Object.assign(this, data)
    }

    ingredients_to_txt(): string {
        const raw_ingred = this.ingredients.reduce((agg, ing): string => {
            const quant_str = ing.quantity ? `${ing.quantity}${ing.unit ? ' ' + ing.unit : ''} of ` : ''
            const note_str = ing.notes ? ` (${ing.notes.trim()})` : ''
            return agg + `\n${quant_str}${ing.ingredient}${note_str}`
        }, "").trim()

        return raw_ingred
    }
    instructions_to_txt(): string {
        const raw_instruct = this.instructions.reduce((agg, inst, i): string => {
            const inst_str = inst.instruction ? `\n${i+1}) ${inst.instruction}${inst.optional ? ' (Optional)' : ''}` : ''
            return agg + inst_str
        }, "").trim()
        return raw_instruct
    }
}

export const recipe_from_google_recipe = (google_recipe: GoogleRecipeSchema): Recipe => {
    console.log(`@type = ${google_recipe["@type"]}`)
    if (google_recipe["@type"] != "Recipe") {
        if ((google_recipe as any)["@graph"]) {
            const graph_search = (google_recipe as any)["@graph"].filter((x: any) => x["@type"] == "Recipe")
            if(graph_search[0]) {
                google_recipe = graph_search[0]
            }
        }
    }
    const extract_img_url = () => {
        const img: any = google_recipe.image
        console.log(img)
        if (img.url) return [img.url]
        if (typeof img === "string") return [img]
        if (typeof img[0] === "string") return img
        if (typeof img[0] === "object") return img.map((x: any) => x.url)
        return []
    }
    const extract_ingredients = () => {
        const raw_ingred = google_recipe.recipeIngredient
        const ingredients = Array.isArray(raw_ingred) ? raw_ingred.join('\n') : typeof raw_ingred === 'string' ? raw_ingred : ''
        return ingredients
    }
    const extract_instructions = () => {
        const raw_instruct = google_recipe.recipeInstructions
        const instructions = Array.isArray(raw_instruct) ? raw_instruct.map((instruction: any) => instruction.text || "").join('\n') : typeof raw_instruct === 'string' ? raw_instruct : ''
        return instructions
    }
    return new Recipe({
        title: google_recipe.name.replace(/recipe[,:\s]*/i, "").trim() || "Unnamed Recipe",
        description: google_recipe.description || "",
        ingredients: txt_to_ingredients(extract_ingredients()),
        instructions: txt_to_instructions(extract_instructions()),
        servings: parseInt(google_recipe.recipeYield) || 0,
        //active_time: google_recipe.cookTime || 0,
        //total_time: google_recipe.totalTime || 0,
        archived: false,
        version: 1,
        tags: google_recipe.keywords && google_recipe.keywords.split ? google_recipe.keywords.split(',').map((x: string) => x.trim()) || [] : google_recipe.keywords || [], 
        pic_urls: extract_img_url()
    })
}