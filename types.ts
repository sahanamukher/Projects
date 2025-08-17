export interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

export interface FormData {
  vegetables: ImageFile[];
  fruits: ImageFile[];
  proteins: ImageFile[];
  greens: ImageFile[];
  spices: string[];
  otherSpices: string;
  allergies: string[];
  otherAllergies: string;
  dietaryChoices: string[];
  mood: string;
  cookingTime: number;
  servings: number;
  mealType: string;
  cuisine: string;
}

export interface Recipe {
  recipeName: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  missingItems: string[];
  cookingTime: number;
}

export interface FeastFormData {
    theme: string;
    guests: number;
    ageGroup: string;
    cuisine: string;
    allergies: string[];
    otherAllergies: string;
}

export interface FeastMenu {
    menuTitle: string;
    description: string;
    appetizer: { name: string; description: string; };
    mainCourse: { name: string; description: string; };
    dessert: { name: string; description: string; };
    beverage: { name: string; description: string; };
}