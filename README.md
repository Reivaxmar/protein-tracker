# Protein Tracker

A React Native Expo app for tracking daily protein intake with real-time cloud synchronization.

## Features

- 📊 **Home Screen**: View daily protein consumption and remaining allowance below your limit
- 🔐 **User Authentication**: Secure login with Firebase Authentication
- ☁️ **Cloud Sync**: Real-time data synchronization across all your devices
- 👥 **Collaborative Tracking**: Share your account with others for real-time collaboration
- 📷 **Scan Screen**: Use barcode scanner to scan food items (requires camera permissions)
- ➕ **Add Meal Screen**: Manually add foods with name, protein per 100g, and grams eaten
- ⚙️ **Settings Screen**: Configure daily protein limit and manage your account

## Technology Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **Expo Router** for navigation (tab-based navigation)
- **Zustand** for global state management
- **Firebase Authentication** for user login
- **Cloud Firestore** for real-time data synchronization
- **AsyncStorage** for local data persistence and offline access
- **Expo Camera & Barcode Scanner** for scanning barcodes
- **EAS Update** for over-the-air (OTA) updates
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

3. Set up Firebase (required for authentication and cloud sync):
   - Follow the detailed guide in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
   - Configure your Firebase credentials in `/config/firebase.ts`

4. Start the development server:
   ```bash
   npm start
   ```

5. Run on your device:
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
- Change app language (English/Spanish)
- Manage meal tags
- Export your data via email
- View your logged-in account
- Logout from your account

## Authentication & Cloud Sync

### User Authentication
- Create an account with email and password
- Secure login with Firebase Authentication
- Password must be at least 6 characters

### Real-Time Data Synchronization
- All your data (meals, recipes, ingredients, settings) is automatically synced to the cloud
- Data is updated in real-time across all your logged-in devices
- Changes made on one device appear instantly on all other devices
- Offline support: Data is cached locally and synced when you're back online

### Collaborative Features
- Share your account credentials with family members or friends
- Multiple people can log in with the same account on different devices
- Everyone sees the same data and updates in real-time
- Perfect for couples or families tracking protein intake together

### Data Security
- Your data is private and secure
- Only you (and those you share credentials with) can access your data
- Each user's data is isolated in Firebase Firestore
- All communication is encrypted via HTTPS

For detailed Firebase setup instructions, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).

## Data Persistence

All meals and settings are automatically saved both locally (using AsyncStorage) and to the cloud (using Firebase Firestore). Your data persists even after closing the app and is synchronized across all your devices.

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

## Over-The-Air (OTA) Updates

This app is configured with **EAS Update** to deliver JavaScript and asset changes directly to users without requiring them to reinstall the app from the app store.

### How It Works

- The app automatically checks for updates on launch
- If an update is available, it downloads and applies it automatically
- Users will see the updated app on the next restart (or immediately if reloaded)
- Updates only work for JavaScript code and assets (images, fonts, etc.)

### What Requires a New Build

**Native code changes** still require a full rebuild and resubmission to app stores. This includes:
- Changes to `app.config.js` that affect native configuration (permissions, plugins, etc.)
- Adding or updating native modules or dependencies
- Modifying iOS or Android native code
- Changing the app icon or splash screen
- Updates to Expo SDK version

### Publishing Updates

To publish an OTA update:

1. Make your JavaScript or asset changes
2. Run the following command:
   ```bash
   eas update --branch production --message "Your update message"
   ```
3. Users will receive the update the next time they open the app

### Update Channels

The app uses different update channels for different environments:
- **production**: Live app updates for production builds
- **preview**: Testing updates before production release

### Configuration

OTA updates are configured in:
- `app.config.js`: Runtime version and update URL
- `eas.json`: Build profiles and update channels
- `app/_layout.tsx`: Update check logic on app launch

For detailed setup instructions, see [EAS_SETUP.md](./EAS_SETUP.md).

For deployment instructions (web and native), see [DEPLOY.md](./DEPLOY.md).

For more information, see the [Expo Updates documentation](https://docs.expo.dev/versions/latest/sdk/updates/).

## License

See LICENSE file for details.

