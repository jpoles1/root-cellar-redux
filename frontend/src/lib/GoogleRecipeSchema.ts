export interface GoogleRecipeSchema {
    "@context": string;
    "@type": "Recipe";
    name: string;
    image: string[];
    author: {
        "@type": "Person";
        name: string;
    };
    datePublished: string;
    description: string;
    prepTime: string;
    cookTime: string;
    totalTime: string;
    recipeYield: string;
    recipeCategory: string;
    recipeCuisine: string;
    nutrition: {
        "@type": "NutritionInformation";
        servingSize: string;
        calories: string;
        fatContent: string;
        carbohydrateContent: string;
        proteinContent: string;
        fiberContent: string;
        sugarContent: string;
        sodiumContent: string;
    };
    recipeIngredient: string[];
    recipeInstructions: {
        "@type": "HowToStep";
        text: string;
        image?: string;
        name?: string;
        url?: string;
    }[];
    keywords: any //string | string[]
}