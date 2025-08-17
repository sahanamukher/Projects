import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { FormData, FeastFormData, Recipe, FeastMenu } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove "data:image/jpeg;base64,"
      resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });
};

const recipeSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        recipeName: { type: Type.STRING, description: 'The name of the recipe.'},
        description: { type: Type.STRING, description: 'A brief, enticing description of the dish.'},
        ingredients: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'List of ingredients used from what was available.',
        },
        instructions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Step-by-step cooking instructions.',
        },
        missingItems: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'A minimal list of essential items to buy. Should be empty if nothing is needed.',
        },
        cookingTime: { type: Type.INTEGER, description: 'Estimated cooking time in minutes.'}
      },
      required: ["recipeName", "description", "ingredients", "instructions", "missingItems", "cookingTime"],
    },
};

export const generateRecipes = async (formData: FormData): Promise<Recipe[]> => {
  const imageParts = await Promise.all(
    [...formData.vegetables, ...formData.fruits, ...formData.proteins, ...formData.greens].map(async (imgFile) => {
      const base64Data = await fileToBase64(imgFile.file);
      return {
        inlineData: {
          mimeType: imgFile.file.type,
          data: base64Data,
        },
      };
    })
  );

  const allSpices = [...formData.spices, formData.otherSpices].filter(Boolean).join(', ');
  const allAllergies = [...formData.allergies, formData.otherAllergies].filter(Boolean).join(', ');

  const prompt = `You are a creative chef's assistant. Your goal is to suggest delicious recipes using only the ingredients provided, minimizing waste and the need for new groceries. Based on the following images of ingredients and user preferences, generate 2 recipe ideas.

- **User Preferences:**
- Cuisine Preference: ${formData.cuisine === 'Any' ? 'No specific preference, feel free to be creative!' : formData.cuisine}
- Allergies: ${allAllergies || 'None'} (strictly avoid these)
- Dietary Choices: ${formData.dietaryChoices.join(', ') || 'None'}
- Desired Mood: ${formData.mood}
- Meal Type: ${formData.mealType}
- Max Cooking Time: ${formData.cookingTime} minutes
- Servings: ${formData.servings} people
- Available Spices: ${allSpices || 'Basic spices like salt and pepper'}

For each recipe, provide the recipe name, a description, ingredients used, step-by-step instructions, and a minimal list of essential items to buy if something crucial is missing. If nothing is missing, the 'missingItems' list should be empty. Ensure the cooking time for each recipe is within the user's specified limit and the recipe strongly reflects the chosen cuisine.

Return the response as a JSON array adhering to the provided schema.
`;
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
        parts: [
            ...imageParts,
            { text: prompt }
        ]
    },
    config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
    }
  });

  const responseText = response.text.trim();
  try {
    const recipes: Recipe[] = JSON.parse(responseText);
    return recipes;
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON:", responseText);
    throw new Error("The AI returned an unexpected response format. Please try again.");
  }
};


const feastSchema = {
    type: Type.OBJECT,
    properties: {
      menuTitle: { type: Type.STRING, description: 'A creative title for the whole menu.' },
      description: { type: Type.STRING, description: 'A brief, thematic description of the feast.' },
      appetizer: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["name", "description"]
      },
      mainCourse: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["name", "description"]
      },
      dessert: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["name", "description"]
      },
      beverage: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["name", "description"]
      },
    },
    required: ["menuTitle", "description", "appetizer", "mainCourse", "dessert", "beverage"],
};

export const generateFeastMenu = async (formData: FeastFormData): Promise<FeastMenu> => {
    const allAllergies = [...formData.allergies, formData.otherAllergies].filter(Boolean).join(', ');

    const prompt = `You are an expert event caterer. Plan a full course menu (appetizer, main course, dessert, and a beverage suggestion) for a feast based on the following details:
- **Theme/Occasion:** ${formData.theme}
- **Cuisine Preference:** ${formData.cuisine === 'Any' ? 'No specific preference, be creative with the theme.' : formData.cuisine}
- **Number of Guests:** ${formData.guests}
- **Guest Age Profile:** ${formData.ageGroup}
- **Allergies to Avoid:** ${allAllergies || 'None'} (strictly avoid any ingredients related to these allergies)

The menu should be cohesive and appropriate for the theme and strongly reflect the chosen cuisine. For each dish, provide the name and a brief, enticing description. Return the response as a single JSON object adhering to the provided schema.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: feastSchema
        }
    });
    
    const responseText = response.text.trim();
    try {
        const feastMenu: FeastMenu = JSON.parse(responseText);
        return feastMenu;
    } catch (e) {
        console.error("Failed to parse Gemini response as JSON:", responseText);
        throw new Error("The AI returned an unexpected response format. Please try again.");
    }
};