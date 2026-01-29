# Firebase Setup Guide

This guide will help you set up Firebase Authentication and Firestore for the Protein Tracker app.

## Prerequisites

- A Google account
- Node.js and npm installed
- The Protein Tracker app cloned locally

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Enter a project name (e.g., "Protein Tracker")
4. Follow the setup wizard:
   - Google Analytics is optional for this app
5. Click "Create project"

## Step 2: Register Your App

1. In your Firebase project, click on the **Web** icon (`</>`) to add a web app
2. Enter an app nickname (e.g., "Protein Tracker Web")
3. **Do NOT** check "Also set up Firebase Hosting" (we're using GitHub Pages)
4. Click "Register app"
5. You'll see your Firebase configuration object - **keep this page open**, you'll need it in the next step

## Step 3: Configure Firebase in the App

1. Open `/config/firebase.ts` in your code editor
2. Replace the placeholder values with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**Example** (with fake values):
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyBqM9xYz...",
  authDomain: "protein-tracker-abc123.firebaseapp.com",
  projectId: "protein-tracker-abc123",
  storageBucket: "protein-tracker-abc123.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Step 4: Enable Authentication

1. In the Firebase Console, go to **Authentication** in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 5: Set Up Firestore Database

1. In the Firebase Console, go to **Firestore Database** in the left sidebar
2. Click "Create database"
3. Choose a location (select one closest to your users)
4. Start in **Test mode** for development (you can secure it later)
   - Test mode rules expire after 30 days - you'll need to update them
5. Click "Next" and then "Enable"

## Step 6: Configure Firestore Security Rules

1. In Firestore Database, go to the "Rules" tab
2. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

**Important:** These rules ensure that:
- Users must be authenticated to access data
- Users can only access their own data (based on their user ID)
- Data is synced across devices for the same user
- Multiple users can share an account by logging in with the same credentials

## Step 7: Test the Integration

1. Start your development server:
   ```bash
   npm start
   ```

2. Open the app in your browser or mobile device

3. You should see the login screen

4. Try creating a new account:
   - Enter an email address
   - Enter a password (minimum 6 characters)
   - Click "Create Account"

5. After logging in, try:
   - Adding a meal
   - Viewing your meals
   - Logging out and logging back in
   - Opening the app on another device with the same account

## Step 8: Understanding Data Synchronization

### How It Works

- When you log in, the app automatically syncs your data to Firestore
- Any changes you make (adding meals, updating settings, etc.) are immediately saved to Firestore
- If multiple devices are logged in with the same account, they will all receive updates in real-time
- Local data (AsyncStorage) is used as a cache for offline access

### Collaborative Features

- **Account Sharing**: Multiple users can share an account by using the same login credentials
- **Real-time Updates**: When one user adds a meal, all other logged-in devices see the update immediately
- **Conflict Resolution**: Firestore handles conflicts automatically using "last write wins"

### Data Structure

All user data is stored in a single document per user:
```
users/{userId}/
  ├── targetProtein: number
  ├── meals: array
  ├── dailyProteinData: object
  ├── recipes: array
  └── customIngredients: array
```

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Double-check your `apiKey` in `/config/firebase.ts`
- Make sure there are no extra spaces or quotes

### "Missing or insufficient permissions"
- Verify your Firestore security rules are set up correctly
- Make sure you're logged in

### "Network request failed"
- Check your internet connection
- Verify your Firebase project is active in the Firebase Console

### Data not syncing across devices
- Ensure both devices are logged in with the same account
- Check the browser console for any Firebase errors
- Verify your Firestore security rules allow read/write access

## Security Best Practices

1. **Never commit your Firebase config with real credentials to public repositories**
   - Add `/config/firebase.ts` to `.gitignore` if it contains real credentials
   - Or use environment variables for production

2. **Update Firestore security rules for production**
   - Test mode rules expire after 30 days
   - Use stricter rules for production deployments

3. **Use strong passwords**
   - Firebase requires passwords to be at least 6 characters
   - Encourage users to use strong, unique passwords

4. **Enable email verification** (optional)
   - Go to Authentication > Templates in Firebase Console
   - Customize the email verification template
   - Update your app to require email verification

## Production Deployment

When deploying to production:

1. **Use environment variables** for Firebase config:
   - Create a `.env` file (add to `.gitignore`)
   - Store Firebase config values as environment variables
   - Update `config/firebase.ts` to read from environment variables

2. **Update Firestore security rules**:
   - Replace test mode rules with production rules
   - Add validation for data types and sizes
   - Consider adding rate limiting

3. **Enable Firebase security features**:
   - Enable App Check to protect your backend from abuse
   - Set up Firebase Security Rules for stricter access control
   - Monitor usage in Firebase Console

## Support

For more information, see:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
