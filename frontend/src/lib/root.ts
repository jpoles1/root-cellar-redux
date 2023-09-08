import * as iparser from "$lib/ingredient-parser";

export class Ingredient {
	quantity = 0
    unit = ""
    ingredient = ""
    notes = ""
    
    constructor(data?: Partial<Ingredient>) {
        Object.assign(this, data);
    }
}

//Instruction stores data for a step in the recipe
export class Instruction {
	instruction = ""
    duration?: number
    optional = false 
    
    constructor(data?: Partial<Instruction>) {
        Object.assign(this, data);
    }
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
	tags: string[] = []
	og_id = ""
    og_url = ""
	archived = false
    created: number = Date.now()
    last_updated: number = Date.now()
    pics?: any[]

    constructor(data?: Partial<Recipe>) {
        Object.assign(this, data);
    }

    ingredients_to_txt(): string {
        const raw_ingred = this.ingredients.reduce((agg, ing, i): string => {
            return agg + `\n${ing.quantity}${ing.unit ? ' ' + ing.unit : ''} ${ing.ingredient}`
        }, "").trim()

        return raw_ingred
    }
    txt_to_ingredients(txt: string): Ingredient[] {
        const ingredient_stringList = txt
            .split("\n")
            .map(x => x.trim().replaceAll("of ", ""))
            .filter(x => x.length > 0);
        const ingredient_list = ingredient_stringList.map(x => iparser.parse(x) as Ingredient);
        return ingredient_list;
    }

    instructions_to_txt(): string {
        const raw_instruct = this.instructions.reduce((agg, inst, i): string => {
            return agg + `\n${i+1}) ${inst.instruction}${inst.optional ? ' (Optional)' : ''}`
        }, "").trim()
        return raw_instruct
    }
    txt_to_instructions(txt: string): Instruction[] {
        const instruction_list = txt
            .split("\n")
            .map(x => x.trim())
            .filter(x => x.length > 0)
            .map(
                instruction => {
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
            );
        return instruction_list;

    }
}
