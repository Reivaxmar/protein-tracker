# Protein Tracker - Features Overview

## Core Functionality

### 1. Home Screen (index.tsx)
**Purpose**: Main dashboard showing protein tracking status

**Features**:
- Displays current date
- Shows three key metrics:
  - Protein consumed today
  - Remaining protein allowance
  - Target protein goal
- Progress bar with percentage completion
- List of all meals added today with details:
  - Meal name
  - Grams eaten
  - Protein content per 100g
  - Total protein calculated

**State**: Uses Zustand store to get today's data and target protein

---

### 2. Add Meal Screen (add-meal.tsx)
**Purpose**: Manually add meals to track protein intake

**Features**:
- Input fields for:
  - Food name (text)
  - Protein per 100g (decimal number)
  - Grams eaten (decimal number)
- Real-time calculation of total protein
- Form validation with error alerts
- Tips section with common protein values
- Automatically navigates to Home screen after adding

**State**: Calls `addMeal` action from Zustand store

---

### 3. Scan Screen (scan.tsx)
**Purpose**: Scan food barcodes using camera

**Features**:
- Camera permission request
- Live camera view with scan area overlay
- Visual guide with corner markers
- Barcode scanning for formats:
  - EAN-13, EAN-8
  - UPC-A, UPC-E
  - Code-128, Code-39
- Alert displays scanned barcode data
- "Scan Again" functionality
- Note: Requires food database API integration for automatic meal entry

**State**: Local state for camera permissions and scan status

---

### 4. Settings Screen (settings.tsx)
**Purpose**: Configure app settings and view information

**Features**:
- Edit daily protein target
- Recommended values guide:
  - 0.8-1g per kg for maintenance
  - 1.6-2.2g per kg for muscle building
- About section with app description
- Features list
- Save confirmation

**State**: Uses `targetProtein` and `setTargetProtein` from Zustand

---

## State Management (Zustand Store)

### Store Structure
```typescript
{
  targetProtein: number,              // Daily protein goal
  meals: Meal[],                       // All meals ever added
  dailyProteinData: {                  // Organized by date
    [date: string]: DailyProteinData
  }
}
```

### Actions
- `addMeal`: Add new meal and update daily totals
- `setTargetProtein`: Update protein goal
- `getTodayData`: Get current day's data
- `loadData`: Load from AsyncStorage on app start
- `saveData`: Save to AsyncStorage after changes

---

## Data Persistence

**Technology**: AsyncStorage (React Native's local storage)

**What's Saved**:
- All meals with timestamps
- Daily protein data organized by date
- User's target protein setting

**When Data is Saved**:
- After adding a meal
- After updating target protein
- Automatically via store actions

**When Data is Loaded**:
- On app startup (in _layout.tsx)
- Via useEffect in root layout

---

## Navigation (Expo Router)

**Type**: Tab-based navigation (bottom tabs)

**Tabs**:
1. Home - Shows protein tracking dashboard
2. Scan - Opens barcode scanner
3. Add Meal - Form to add meals
4. Settings - Configure app settings

**Icons**: Ionicons from @expo/vector-icons
- Home: "home"
- Scan: "barcode"
- Add Meal: "add-circle"
- Settings: "settings"

**Theme**:
- Active tab color: Blue (#3b82f6)
- Inactive tab color: Gray (#6b7280)
- Header background: Blue (#3b82f6)
- Header text: White

---

## Styling Approach

**Method**: React Native StyleSheet API

**Design System**:
- Colors:
  - Primary: #3b82f6 (blue)
  - Text dark: #1f2937
  - Text light: #6b7280
  - Background: #f3f4f6
  - Card background: #ffffff
  - Border: #d1d5db
- Shadows for cards (elevation on Android)
- Rounded corners (borderRadius: 8-12)
- Consistent spacing (padding: 12-20)

---

## TypeScript Types

### Meal
```typescript
{
  id: string,
  name: string,
  proteinPer100g: number,
  gramsEaten: number,
  totalProtein: number,      // Calculated
  date: string,               // ISO date string
  timestamp: number
}
```

### DailyProteinData
```typescript
{
  date: string,
  totalProtein: number,
  targetProtein: number,
  meals: Meal[]
}
```

---

## Future Enhancements

Potential features that could be added:
- Food database API integration (Open Food Facts)
- Meal history and statistics
- Weekly/monthly protein charts
- Nutrition tracking beyond protein
- Meal templates and favorites
- Export data functionality
- Dark mode support
- Meal photos
- Reminders and notifications
