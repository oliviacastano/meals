import RecipeFieldsForm from './RecipeFieldsForm';
import { addRecipe, type RecipeEditableFields } from '../lib/recipeStore';

export default function RecipeForm() {
  function handleSubmit(values: RecipeEditableFields, image: string | null) {
    const recipe = addRecipe(values, image);
    window.location.href = `/rezepte/${recipe.id}`;
  }

  return (
    <RecipeFieldsForm
      submitLabel="Rezept speichern"
      onCancel={() => {
        window.location.href = '/rezepte';
      }}
      onSubmit={handleSubmit}
    />
  );
}
