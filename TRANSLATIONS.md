# Translations Guide

This document provides guidance for completing the internationalization (i18n) of the Protein Tracker app.

## What's Been Completed

### ✅ Completed Screens
- **Settings Screen** - Fully translated including the new language selector
- **Home/Index Screen** - All strings translated
- **Recipes Screen** - All strings translated
- **Navigation/Layout** - All tab titles translated

### ✅ Infrastructure
- Created `/translations/index.ts` with comprehensive English and Spanish translations
- Created `/store/languageStore.ts` for language state management
- Integrated language loading in `_layout.tsx`

## Remaining Work

### Screens to Translate

#### 1. Quick Meal Screen (`app/quick-meal.tsx`)
This is a large file with many UI strings. Key areas to translate:
- Search interface
- Filter labels
- Custom ingredient modal
- Barcode scanner modal
- Alert messages
- Button texts

**Pattern to follow:**
```typescript
// Add at top of file
import { useLanguageStore } from '../store/languageStore';

// In component
const t = useLanguageStore((state) => state.translations);

// Replace strings
Alert.alert('Error', 'Please enter a search term');
// becomes
Alert.alert(t.error, 'Please enter a search term');

<Text>Search for food...</Text>
// becomes
<Text>{t.quickMeal.searchPlaceholder}</Text>
```

#### 2. Create Recipe Screen (`app/create-recipe.tsx`)
Similar to Quick Meal screen with recipe-specific strings.

**Key translations available:**
- `t.createRecipe.title`
- `t.createRecipe.recipeName`
- `t.createRecipe.searchIngredients`
- `t.createRecipe.saveRecipe`
- etc.

#### 3. Calculate Amounts Screen (`app/calculate-amounts.tsx`)
Calculator-specific interface strings.

**Key translations available:**
- `t.calculator.title`
- `t.calculator.targetProtein`
- `t.calculator.ingredientsRatios`
- `t.calculator.calculatedAmounts`
- etc.

## How to Use Translations

### 1. Import the language store
```typescript
import { useLanguageStore } from '../store/languageStore';
```

### 2. Get translations in component
```typescript
const t = useLanguageStore((state) => state.translations);
```

### 3. Replace hard-coded strings
```typescript
// Before
<Text>My Title</Text>

// After
<Text>{t.section.myTitle}</Text>
```

### 4. For Alert messages
```typescript
// Before
Alert.alert('Success', 'Item saved!');

// After
Alert.alert(t.success, t.section.itemSaved);
```

## Food Categories

Food categories have their own translation section:

```typescript
t.categories.all      // All / Todos
t.categories.meats    // Meats / Carnes
t.categories.dairy    // Dairy / Lácteos
t.categories.fish     // Fish / Pescado
// etc.
```

Use these in the FOOD_CATEGORIES array:

```typescript
const FOOD_CATEGORIES = [
  { label: t.categories.all, value: '' },
  { label: t.categories.meats, value: 'meats' },
  { label: t.categories.dairy, value: 'dairies' },
  { label: t.categories.fish, value: 'fish' },
  { label: t.categories.vegetables, value: 'vegetables' },
  { label: t.categories.fruits, value: 'fruits' },
  { label: t.categories.grains, value: 'cereals-and-potatoes' },
  { label: t.categories.legumes, value: 'legumes' },
];
```

## Testing

After completing translations:

1. **Test language switching**
   - Go to Settings
   - Switch between English and Español
   - Navigate to each screen
   - Verify all text changes

2. **Check for missing translations**
   - Look for any hard-coded English text
   - Verify all Alert messages are translated
   - Check button labels
   - Verify placeholder text

3. **Test edge cases**
   - Pluralization (1 item vs 2 items)
   - Long Spanish text doesn't overflow UI
   - Modal dialogs show correct language

## Translation Keys Reference

All translation keys are defined in `/translations/index.ts`. The structure is:

```
translations
├── common (cancel, delete, save, success, error, close)
├── nav (tab navigation titles)
├── home (home screen)
├── settings (settings screen)
├── quickMeal (quick meal screen)
├── recipes (recipes screen)
├── createRecipe (create recipe screen)
├── calculator (calculator screen)
└── categories (food categories)
```

## Adding New Translations

If you need to add new strings:

1. Add to both `en` and `es` objects in `/translations/index.ts`
2. Update the `Translations` interface
3. Use the new key in your component

Example:
```typescript
// In translations/index.ts
export interface Translations {
  // ...
  myNewSection: {
    myNewString: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    // ...
    myNewSection: {
      myNewString: 'My New String',
    },
  },
  es: {
    // ...
    myNewSection: {
      myNewString: 'Mi Nueva Cadena',
    },
  },
};
```

## Notes

- The translation file already contains ALL the strings needed for all screens
- Just need to replace hard-coded strings with translation keys
- Pattern is consistent across all files
- Spanish translations are already complete and ready to use
