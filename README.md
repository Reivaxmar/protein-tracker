# Protein Tracker

A React Native Expo app for tracking daily protein intake.

## Features

- 📊 **Home Screen**: View daily protein consumption and remaining allowance below your limit
- 📷 **Scan Screen**: Use barcode scanner to scan food items (requires camera permissions)
- ➕ **Add Meal Screen**: Manually add foods with name, protein per 100g, and grams eaten
- ⚙️ **Settings Screen**: Configure daily protein limit

## Technology Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **Expo Router** for navigation (tab-based navigation)
- **Zustand** for global state management
- **AsyncStorage** for data persistence
- **Expo Camera & Barcode Scanner** for scanning barcodes
- **StyleSheet** for styling (following React Native best practices)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Reivaxmar/protein-tracker.git
   cd protein-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on your device:
   - **iOS**: Press `i` in the terminal or scan the QR code with the Camera app
   - **Android**: Press `a` in the terminal or scan the QR code with the Expo Go app
   - **Web**: Press `w` in the terminal

## Project Structure

```
protein-tracker/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout with tab navigation
│   ├── index.tsx          # Home screen
│   ├── add-meal.tsx       # Add meal screen
│   ├── scan.tsx           # Barcode scanner screen
│   └── settings.tsx       # Settings screen
├── store/
│   └── proteinStore.ts    # Zustand store with AsyncStorage
├── types/
│   └── index.ts           # TypeScript type definitions
├── utils/
│   ├── helpers.ts         # Helper functions
│   └── api.ts             # OpenFoodFacts API integration
└── assets/                # App icons and images
```

## Usage

### Home Screen
- View your daily protein limit
- See total protein consumed today
- Check remaining allowance below your limit
- View all meals added today
- Progress bar shows percentage of daily limit (with warnings when approaching or exceeding)

### Add Meal
1. Enter the food name
2. Enter protein per 100g (check food labels)
3. Enter grams eaten
4. The app automatically calculates total protein
5. Tap "Add Meal" to save

### Scan Barcode
1. Grant camera permissions when prompted
2. Point camera at a food barcode
3. The app automatically queries the OpenFoodFacts database
4. View detailed product information including:
   - Product name and brand
   - Protein content per 100g
   - Other nutrients (energy, carbs, fat, fiber, etc.)
5. Enter the quantity you ate (in grams)
6. See the calculated total protein
7. Tap "Add to Meal" to save the food to your daily log
8. The meal is automatically saved and your daily protein total is updated

### Settings
- Set your daily protein limit to help manage your protein intake
- View app information and features

## Data Persistence

All meals and settings are automatically saved to your device using AsyncStorage. Your data persists even after closing the app.

## State Management

The app uses Zustand for global state management with the following features:
- Track meals by date
- Calculate daily protein totals
- Persist data to AsyncStorage
- Update maximum protein limit

## Development

### Type Checking
```bash
npx tsc --noEmit
```

### Start Development Server
```bash
npm start
```

## License

See LICENSE file for details.

