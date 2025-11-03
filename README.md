# Protein Tracker

A React Native Expo app for tracking daily protein intake.

## Features

- 📊 **Home Screen**: View daily protein consumption and remaining allowance
- 📷 **Scan Screen**: Use barcode scanner to scan food items
- ➕ **Add Meal Screen**: Manually add foods with name, protein per 100g, and grams eaten
- ⚙️ **Settings Screen**: Configure daily protein target

## Technology Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **Expo Router** for navigation
- **Zustand** for global state management
- **AsyncStorage** for data persistence
- **Expo Barcode Scanner** for scanning barcodes
- **NativeWind** (Tailwind CSS) for styling

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

## Usage

### Home Screen
- View your daily protein goal
- See total protein consumed today
- Check remaining protein allowance
- View all meals added today
- Progress bar shows completion percentage

### Add Meal
1. Enter the food name
2. Enter protein per 100g (check food labels)
3. Enter grams eaten
4. The app automatically calculates total protein
5. Tap "Add Meal" to save

### Scan Barcode
1. Grant camera permissions when prompted
2. Point camera at a food barcode
3. The app will scan and display the barcode data
4. Note: Requires integration with a food database API for full functionality

### Settings
- Adjust your daily protein target
- View app information and features

## Data Persistence

All meals and settings are automatically saved to your device using AsyncStorage. Your data persists even after closing the app.

## License

See LICENSE file for details.
