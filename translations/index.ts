export type Language = 'en' | 'es';

export interface Translations {
  // Common
  cancel: string;
  delete: string;
  save: string;
  success: string;
  error: string;
  close: string;
  
  // Navigation
  nav: {
    home: string;
    recipes: string;
    createRecipe: string;
    quickMeal: string;
    calculator: string;
    settings: string;
  };
  
  // Home Screen
  home: {
    title: string;
    todaysProgress: string;
    consumed: string;
    belowLimit: string;
    overLimit: string;
    dailyLimit: string;
    ofDailyLimit: string;
    todaysMeals: string;
    noMealsYet: string;
    proteinPer100g: string;
  };
  
  // Settings Screen
  settings: {
    title: string;
    dailyProteinLimit: string;
    maximumProtein: string;
    placeholder: string;
    hint: string;
    saveLimit: string;
    successMessage: string;
    errorMessage: string;
    aboutTitle: string;
    aboutText: string;
    featuresTitle: string;
    featuresText: string;
    language: string;
    selectLanguage: string;
  };
  
  // Quick Meal Screen
  quickMeal: {
    title: string;
    subtitle: string;
    searchIngredients: string;
    searchPlaceholder: string;
    search: string;
    filters: string;
    scanBarcode: string;
    addCustomIngredient: string;
    category: string;
    minProtein: string;
    brand: string;
    searchResults: string;
    selectedProduct: string;
    amount: string;
    proteinInAmount: string;
    addIngredient: string;
    mealIngredients: string;
    totalMeal: string;
    logMealForToday: string;
    aboutTitle: string;
    aboutText: string;
    customIngredientTitle: string;
    ingredientName: string;
    proteinPer100g: string;
    totalProtein: string;
    noResults: string;
    scanTitle: string;
    productNotFound: string;
    tryAgain: string;
    cameraPermissionRequired: string;
    fetchingProduct: string;
    tapToScanAgain: string;
    ingredientAdded: string;
    mealLogged: string;
    viewHome: string;
    addAnother: string;
    errorNoProduct: string;
    errorNoProtein: string;
    errorInvalidAmount: string;
    errorAtLeastOne: string;
  };
  
  // Recipes Screen
  recipes: {
    title: string;
    subtitle: string;
    noRecipesTitle: string;
    noRecipesText: string;
    createRecipe: string;
    ingredient: string;
    ingredients: string;
    logRecipe: string;
    logAsMeal: string;
    deleteRecipe: string;
    deleteConfirm: string;
    recipeDeleted: string;
    addedRecipe: string;
    serving: string;
    servings: string;
    quickTip: string;
    quickTipText: string;
    howMany: string;
    howManyGrams: string;
    totalRecipe: string;
    log: string;
    logByWeight: string;
    errorInvalidServings: string;
    errorInvalidGrams: string;
    recipe: string;
    recipeSaved: string;
  };
  
  // Create Recipe Screen
  createRecipe: {
    title: string;
    recipeName: string;
    recipeNamePlaceholder: string;
    searchIngredients: string;
    searchPlaceholder: string;
    search: string;
    filters: string;
    scanBarcode: string;
    addCustomIngredient: string;
    category: string;
    minProtein: string;
    brand: string;
    searchResults: string;
    selectedProduct: string;
    amount: string;
    proteinInAmount: string;
    addToRecipe: string;
    recipeIngredients: string;
    totalRecipe: string;
    saveRecipe: string;
    tips: string;
    tipsText: string;
    customIngredientTitle: string;
    ingredientName: string;
    proteinPer100g: string;
    totalProtein: string;
    errorNoName: string;
    errorNoIngredients: string;
    recipeSaved: string;
    ingredientAdded: string;
  };
  
  // Calculator Screen
  calculator: {
    title: string;
    subtitle: string;
    targetProtein: string;
    yourStatus: string;
    dailyLimit: string;
    consumed: string;
    remaining: string;
    proteinAmount: string;
    amountPlaceholder: string;
    hint: string;
    ingredientsRatios: string;
    noIngredientsYet: string;
    noIngredientsHint: string;
    proteinPer100g: string;
    gramsRatio: string;
    adjustGramsRatios: string;
    adjustHint: string;
    addIngredient: string;
    calculatedAmounts: string;
    provides: string;
    ofTotal: string;
    totalGrams: string;
    totalProtein: string;
    howToUse: string;
    howToUseText: string;
    ingredientName: string;
    ratiosWillBeSet: string;
    ingredientAdded: string;
  };
  
  // Food Categories
  categories: {
    all: string;
    meats: string;
    dairy: string;
    fish: string;
    vegetables: string;
    fruits: string;
    grains: string;
    legumes: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    // Common
    cancel: 'Cancel',
    delete: 'Delete',
    save: 'Save',
    success: 'Success',
    error: 'Error',
    close: 'Close',
    
    // Navigation
    nav: {
      home: 'Home',
      recipes: 'Recipes',
      createRecipe: 'Create Recipe',
      quickMeal: 'Quick Meal',
      calculator: 'Calculator',
      settings: 'Settings',
    },
    
    // Home Screen
    home: {
      title: 'Protein Tracker',
      todaysProgress: "Today's Progress",
      consumed: 'Consumed',
      belowLimit: 'Below Limit',
      overLimit: 'Over Limit',
      dailyLimit: 'Daily Limit',
      ofDailyLimit: 'of Daily Limit',
      todaysMeals: "Today's Meals",
      noMealsYet: 'No meals added yet today',
      proteinPer100g: 'g protein/100g',
    },
    
    // Settings Screen
    settings: {
      title: 'Settings',
      dailyProteinLimit: 'Daily Protein Limit',
      maximumProtein: 'Maximum Protein (grams per day)',
      placeholder: 'e.g., 150',
      hint: 'Set your daily protein limit. The app will track your intake\nand alert you when approaching or exceeding your limit.',
      saveLimit: 'Save Limit',
      successMessage: 'Protein limit updated successfully!',
      errorMessage: 'Please enter a valid protein limit value',
      aboutTitle: 'About Protein Tracker',
      aboutText: 'Track your daily protein intake to stay within your limit. Add meals manually or scan barcodes to monitor your protein consumption.',
      featuresTitle: 'Features',
      featuresText: '✓ Track daily protein intake\n✓ Add meals with custom protein values\n✓ Scan barcodes (requires food database integration)\n✓ Monitor remaining allowance below your limit\n✓ Data persists across app restarts',
      language: 'Language',
      selectLanguage: 'Select Language',
    },
    
    // Quick Meal Screen
    quickMeal: {
      title: 'Quick Meal',
      subtitle: 'Add a one-time meal without saving it as a recipe',
      searchIngredients: 'Search Ingredients',
      searchPlaceholder: 'Search for food...',
      search: 'Search',
      filters: 'Filters',
      scanBarcode: '📷 Scan Barcode',
      addCustomIngredient: '➕ Add Custom Ingredient',
      category: 'Category',
      minProtein: 'Minimum Protein (g/100g)',
      brand: 'Brand / Manufacturer',
      searchResults: 'Search Results:',
      selectedProduct: 'Selected Product:',
      amount: 'Amount (grams)',
      proteinInAmount: 'Protein in this amount:',
      addIngredient: 'Add Ingredient',
      mealIngredients: 'Meal Ingredients',
      totalMeal: 'Total Meal:',
      logMealForToday: 'Log Meal for Today',
      aboutTitle: '💡 About Quick Meal',
      aboutText: '• Search for ingredients or scan barcodes\n• Filter by category, brand, or minimum protein\n• Add custom ingredients with your own values\n• Add multiple items to build your meal\n• This meal won\'t be saved as a recipe\n• Perfect for one-time meals!',
      customIngredientTitle: 'Add Custom Ingredient',
      ingredientName: 'Ingredient Name',
      proteinPer100g: 'Protein per 100g',
      totalProtein: 'Total Protein:',
      noResults: 'No products found matching your criteria',
      scanTitle: 'Scan Product Barcode',
      productNotFound: 'No product information found for barcode:',
      tryAgain: 'Try Again',
      cameraPermissionRequired: 'Camera permission is required',
      fetchingProduct: 'Fetching product info...',
      tapToScanAgain: 'Tap to Scan Again',
      ingredientAdded: 'Ingredient added',
      mealLogged: 'Meal logged!',
      viewHome: 'View Home',
      addAnother: 'Add Another',
      errorNoProduct: 'No product selected',
      errorNoProtein: 'This product does not have protein information',
      errorInvalidAmount: 'Please enter a valid amount in grams',
      errorAtLeastOne: 'Please add at least one ingredient',
    },
    
    // Recipes Screen
    recipes: {
      title: 'My Recipes',
      subtitle: 'saved',
      noRecipesTitle: 'No Recipes Yet',
      noRecipesText: 'Create your first recipe to quickly log meals with multiple ingredients',
      createRecipe: 'Create Recipe',
      ingredient: 'ingredient',
      ingredients: 'ingredients',
      logRecipe: 'Log Recipe',
      logAsMeal: 'Log as Meal',
      deleteRecipe: 'Delete Recipe',
      deleteConfirm: 'Are you sure you want to delete',
      recipeDeleted: 'Recipe deleted',
      addedRecipe: 'Added',
      serving: 'serving',
      servings: 'servings',
      quickTip: '💡 Quick Tip',
      quickTipText: 'Tap on a recipe to see details and log it as a meal. You can specify multiple servings when logging!',
      howMany: 'How many servings of',
      howManyGrams: 'How many grams of',
      totalRecipe: 'Total recipe:',
      log: 'Log',
      logByWeight: 'Log by Weight',
      errorInvalidServings: 'Please enter a valid number of servings',
      errorInvalidGrams: 'Please enter a valid weight in grams',
      recipe: 'recipe',
      recipeSaved: 'recipes saved',
    },
    
    // Create Recipe Screen
    createRecipe: {
      title: 'Create New Recipe',
      recipeName: 'Recipe Name',
      recipeNamePlaceholder: 'e.g., Protein Sandwich',
      searchIngredients: 'Search Ingredients',
      searchPlaceholder: 'Search for food...',
      search: 'Search',
      filters: 'Filters',
      scanBarcode: '📷 Scan Barcode',
      addCustomIngredient: '➕ Add Custom Ingredient',
      category: 'Category',
      minProtein: 'Minimum Protein (g/100g)',
      brand: 'Brand / Manufacturer',
      searchResults: 'Search Results:',
      selectedProduct: 'Selected Product:',
      amount: 'Amount (grams)',
      proteinInAmount: 'Protein in this amount:',
      addToRecipe: 'Add to Recipe',
      recipeIngredients: 'Recipe Ingredients',
      totalRecipe: 'Total Recipe:',
      saveRecipe: 'Save Recipe',
      tips: '💡 Tips',
      tipsText: '• Search for ingredients by name\n• Use filters to narrow down results (category, brand, protein)\n• Scan barcodes to quickly add packaged foods\n• Add custom ingredients with your own protein values\n• Add multiple ingredients to build your recipe\n• Once saved, you can quickly log the recipe as a meal',
      customIngredientTitle: 'Add Custom Ingredient',
      ingredientName: 'Ingredient Name',
      proteinPer100g: 'Protein per 100g',
      totalProtein: 'Total Protein:',
      errorNoName: 'Please enter a recipe name',
      errorNoIngredients: 'Please add at least one ingredient',
      recipeSaved: 'Recipe saved successfully!',
      ingredientAdded: 'Ingredient added to recipe',
    },
    
    // Calculator Screen
    calculator: {
      title: 'Protein Calculator',
      subtitle: 'Set a protein target and ingredient ratios to calculate exact amounts needed',
      targetProtein: 'Target Protein',
      yourStatus: 'Your Status:',
      dailyLimit: 'Daily Limit:',
      consumed: 'Consumed:',
      remaining: 'Remaining:',
      proteinAmount: 'Protein Amount (g)',
      amountPlaceholder: 'e.g., 50',
      hint: 'Amount of protein you want to consume',
      ingredientsRatios: 'Ingredients & Ratios',
      noIngredientsYet: 'No ingredients added yet',
      noIngredientsHint: 'Add ingredients and use the slider to set ratios',
      proteinPer100g: 'g protein/100g',
      gramsRatio: 'Grams Ratio:',
      adjustGramsRatios: 'Adjust Grams Ratios',
      adjustHint: 'Drag the points to adjust the proportion of grams for each ingredient',
      addIngredient: '+ Add Ingredient',
      calculatedAmounts: 'Calculated Amounts',
      provides: 'Provides:',
      ofTotal: 'of total',
      totalGrams: 'Total Grams:',
      totalProtein: 'Total Protein:',
      howToUse: '💡 How to Use',
      howToUseText: '1. Set your target protein amount (defaults to remaining for today)\n2. Add ingredients with their protein content per 100g\n3. Use the visual slider to adjust the grams ratio of each ingredient\n4. Drag the points on the slider to change grams proportions\n5. See calculated amounts needed of each ingredient\n\nThe slider divides ingredients by grams percentage - drag points to adjust!',
      ingredientName: 'Ingredient Name',
      ratiosWillBeSet: 'Ratios will be set using the slider after adding',
      ingredientAdded: 'Ingredient added',
    },
    
    // Food Categories
    categories: {
      all: 'All',
      meats: 'Meats',
      dairy: 'Dairy',
      fish: 'Fish',
      vegetables: 'Vegetables',
      fruits: 'Fruits',
      grains: 'Grains',
      legumes: 'Legumes',
    },
  },
  es: {
    // Común
    cancel: 'Cancelar',
    delete: 'Eliminar',
    save: 'Guardar',
    success: 'Éxito',
    error: 'Error',
    close: 'Cerrar',
    
    // Navegación
    nav: {
      home: 'Inicio',
      recipes: 'Recetas',
      createRecipe: 'Crear Receta',
      quickMeal: 'Comida Rápida',
      calculator: 'Calculadora',
      settings: 'Configuración',
    },
    
    // Pantalla de Inicio
    home: {
      title: 'Seguimiento de Proteínas',
      todaysProgress: 'Progreso de Hoy',
      consumed: 'Consumido',
      belowLimit: 'Por Debajo del Límite',
      overLimit: 'Por Encima del Límite',
      dailyLimit: 'Límite Diario',
      ofDailyLimit: 'del Límite Diario',
      todaysMeals: 'Comidas de Hoy',
      noMealsYet: 'Aún no se han añadido comidas hoy',
      proteinPer100g: 'g de proteína/100g',
    },
    
    // Pantalla de Configuración
    settings: {
      title: 'Configuración',
      dailyProteinLimit: 'Límite Diario de Proteínas',
      maximumProtein: 'Proteína Máxima (gramos por día)',
      placeholder: 'p. ej., 150',
      hint: 'Establece tu límite diario de proteínas. La aplicación hará un seguimiento de tu consumo\ny te avisará cuando te acerques o superes tu límite.',
      saveLimit: 'Guardar Límite',
      successMessage: '¡Límite de proteínas actualizado correctamente!',
      errorMessage: 'Por favor, introduce un valor válido para el límite de proteínas',
      aboutTitle: 'Acerca de Seguimiento de Proteínas',
      aboutText: 'Controla tu ingesta diaria de proteínas para mantenerte dentro de tu límite. Añade comidas manualmente o escanea códigos de barras para monitorizar tu consumo de proteínas.',
      featuresTitle: 'Funciones',
      featuresText: '✓ Seguimiento diario de proteínas\n✓ Añadir comidas con valores de proteínas personalizados\n✓ Escanear códigos de barras (requiere integración con base de datos de alimentos)\n✓ Monitorizar el margen restante por debajo de tu límite\n✓ Los datos se conservan entre reinicios de la aplicación',
      language: 'Idioma',
      selectLanguage: 'Seleccionar Idioma',
    },
    
    // Pantalla de Comida Rápida
    quickMeal: {
      title: 'Comida Rápida',
      subtitle: 'Añade una comida puntual sin guardarla como receta',
      searchIngredients: 'Buscar Ingredientes',
      searchPlaceholder: 'Buscar alimento...',
      search: 'Buscar',
      filters: 'Filtros',
      scanBarcode: '📷 Escanear Código de Barras',
      addCustomIngredient: '➕ Añadir Ingrediente Personalizado',
      category: 'Categoría',
      minProtein: 'Proteína Mínima (g/100g)',
      brand: 'Marca / Fabricante',
      searchResults: 'Resultados de Búsqueda:',
      selectedProduct: 'Producto Seleccionado:',
      amount: 'Cantidad (gramos)',
      proteinInAmount: 'Proteína en esta cantidad:',
      addIngredient: 'Añadir Ingrediente',
      mealIngredients: 'Ingredientes de la Comida',
      totalMeal: 'Total de la Comida:',
      logMealForToday: 'Registrar Comida de Hoy',
      aboutTitle: '💡 Acerca de Comida Rápida',
      aboutText: '• Busca ingredientes o escanea códigos de barras\n• Filtra por categoría, marca o proteína mínima\n• Añade ingredientes personalizados con tus propios valores\n• Añade varios elementos para crear tu comida\n• Esta comida no se guardará como receta\n• ¡Perfecto para comidas puntuales!',
      customIngredientTitle: 'Añadir Ingrediente Personalizado',
      ingredientName: 'Nombre del Ingrediente',
      proteinPer100g: 'Proteína por 100 g',
      totalProtein: 'Proteína Total:',
      noResults: 'No se encontraron productos que coincidan con tus criterios',
      scanTitle: 'Escanear Código de Barras del Producto',
      productNotFound: 'No se encontró información del producto para el código de barras:',
      tryAgain: 'Intentar de Nuevo',
      cameraPermissionRequired: 'Se requiere permiso de cámara',
      fetchingProduct: 'Obteniendo información del producto...',
      tapToScanAgain: 'Toca para Escanear de Nuevo',
      ingredientAdded: 'Ingrediente añadido',
      mealLogged: '¡Comida registrada!',
      viewHome: 'Ver Inicio',
      addAnother: 'Añadir Otro',
      errorNoProduct: 'No se ha seleccionado ningún producto',
      errorNoProtein: 'Este producto no tiene información de proteínas',
      errorInvalidAmount: 'Por favor, introduce una cantidad válida en gramos',
      errorAtLeastOne: 'Por favor, añade al menos un ingrediente',
    },
    
    // Pantalla de Recetas
    recipes: {
      title: 'Mis Recetas',
      subtitle: 'guardadas',
      noRecipesTitle: 'Aún No Hay Recetas',
      noRecipesText: 'Crea tu primera receta para registrar rápidamente comidas con varios ingredientes',
      createRecipe: 'Crear Receta',
      ingredient: 'ingrediente',
      ingredients: 'ingredientes',
      logRecipe: 'Registrar Receta',
      logAsMeal: 'Registrar como Comida',
      deleteRecipe: 'Eliminar Receta',
      deleteConfirm: '¿Seguro que deseas eliminar',
      recipeDeleted: 'Receta eliminada',
      addedRecipe: 'Añadida',
      serving: 'ración',
      servings: 'raciones',
      quickTip: '💡 Consejo Rápido',
      quickTipText: 'Toca una receta para ver los detalles y registrarla como comida. ¡Puedes especificar varias raciones al registrar!',
      howMany: '¿Cuántas raciones de',
      howManyGrams: '¿Cuántos gramos de',
      totalRecipe: 'Receta total:',
      log: 'Registrar',
      logByWeight: 'Registrar por Peso',
      errorInvalidServings: 'Por favor, introduce un número válido de raciones',
      errorInvalidGrams: 'Por favor, introduce un peso válido en gramos',
      recipe: 'receta',
      recipeSaved: 'recetas guardadas',
    },
    
    // Pantalla de Crear Receta
    createRecipe: {
      title: 'Crear Nueva Receta',
      recipeName: 'Nombre de la Receta',
      recipeNamePlaceholder: 'p. ej., Sándwich Proteico',
      searchIngredients: 'Buscar Ingredientes',
      searchPlaceholder: 'Buscar alimento...',
      search: 'Buscar',
      filters: 'Filtros',
      scanBarcode: '📷 Escanear Código de Barras',
      addCustomIngredient: '➕ Añadir Ingrediente Personalizado',
      category: 'Categoría',
      minProtein: 'Proteína Mínima (g/100g)',
      brand: 'Marca / Fabricante',
      searchResults: 'Resultados de Búsqueda:',
      selectedProduct: 'Producto Seleccionado:',
      amount: 'Cantidad (gramos)',
      proteinInAmount: 'Proteína en esta cantidad:',
      addToRecipe: 'Añadir a la Receta',
      recipeIngredients: 'Ingredientes de la Receta',
      totalRecipe: 'Receta Total:',
      saveRecipe: 'Guardar Receta',
      tips: '💡 Consejos',
      tipsText: '• Busca ingredientes por nombre\n• Usa filtros para acotar resultados (categoría, marca, proteína)\n• Escanea códigos de barras para añadir alimentos envasados rápidamente\n• Añade ingredientes personalizados con tus propios valores de proteína\n• Añade varios ingredientes para construir tu receta\n• Una vez guardada, puedes registrar rápidamente la receta como comida',
      customIngredientTitle: 'Añadir Ingrediente Personalizado',
      ingredientName: 'Nombre del Ingrediente',
      proteinPer100g: 'Proteína por 100 g',
      totalProtein: 'Proteína Total:',
      errorNoName: 'Por favor, introduce un nombre para la receta',
      errorNoIngredients: 'Por favor, añade al menos un ingrediente',
      recipeSaved: '¡Receta guardada correctamente!',
      ingredientAdded: 'Ingrediente añadido a la receta',
    },
    
    // Pantalla de Calculadora
    calculator: {
      title: 'Calculadora de Proteínas',
      subtitle: 'Establece un objetivo de proteínas y proporciones de ingredientes para calcular cantidades exactas',
      targetProtein: 'Proteína Objetivo',
      yourStatus: 'Tu Estado:',
      dailyLimit: 'Límite Diario:',
      consumed: 'Consumido:',
      remaining: 'Restante:',
      proteinAmount: 'Cantidad de Proteína (g)',
      amountPlaceholder: 'p. ej., 50',
      hint: 'Cantidad de proteína que deseas consumir',
      ingredientsRatios: 'Ingredientes y Proporciones',
      noIngredientsYet: 'Aún no se han añadido ingredientes',
      noIngredientsHint: 'Añade ingredientes y usa el control deslizante para establecer proporciones',
      proteinPer100g: 'g de proteína/100g',
      gramsRatio: 'Proporción en Gramos:',
      adjustGramsRatios: 'Ajustar Proporciones de Gramos',
      adjustHint: 'Arrastra los puntos para ajustar la proporción de gramos de cada ingrediente',
      addIngredient: '+ Añadir Ingrediente',
      calculatedAmounts: 'Cantidades Calculadas',
      provides: 'Aporta:',
      ofTotal: 'del total',
      totalGrams: 'Gramos Totales:',
      totalProtein: 'Proteína Total:',
      howToUse: '💡 Cómo Usar',
      howToUseText: '1. Establece tu cantidad objetivo de proteínas (por defecto, lo restante para hoy)\n2. Añade ingredientes con su contenido de proteínas por 100 g\n3. Usa el control deslizante visual para ajustar la proporción de gramos de cada ingrediente\n4. Arrastra los puntos del control para cambiar las proporciones\n5. Observa las cantidades calculadas necesarias de cada ingrediente\n\nEl control deslizante divide los ingredientes por porcentaje de gramos: ¡arrastra los puntos para ajustar!',
      ingredientName: 'Nombre del Ingrediente',
      ratiosWillBeSet: 'Las proporciones se establecerán usando el control deslizante después de añadir',
      ingredientAdded: 'Ingrediente añadido',
    },
    
    // Categorías de Alimentos
    categories: {
      all: 'Todos',
      meats: 'Carnes',
      dairy: 'Lácteos',
      fish: 'Pescado',
      vegetables: 'Verduras',
      fruits: 'Frutas',
      grains: 'Cereales',
      legumes: 'Legumbres',
    },
  },
};

export function getTranslation(language: Language): Translations {
  return translations[language];
}
