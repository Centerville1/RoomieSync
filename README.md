# RoomieSync Frontend

A React Native + Expo app for managing shared expenses and household tasks with roommates.

## Features

- 🔐 User authentication (login/register)
- 🏠 Multi-house support with invite codes
- 💰 Expense tracking and balance management  
- 🛒 Collaborative shopping lists with recurring items
- 💸 Payment recording between roommates
- 📱 Mobile-first design with WhatsApp-inspired UI
- 🎨 Customizable user and house colors/images

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for navigation (bottom tabs + stack)
- **Axios** for API calls
- **AsyncStorage** for local data persistence
- **Expo Vector Icons** for icons
- **React Native Paper/Elements** for UI components

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── UI/              # Basic UI components (Button, Input, Card, Avatar)
│   └── Forms/           # Form-specific components
├── screens/             # Screen components
│   ├── Auth/            # Login, Register, Join/Create House
│   ├── Home/            # Main dashboard
│   ├── ShareCost/       # Expense splitting flow
│   └── Profile/         # User profile and settings
├── navigation/          # Navigation configuration
├── services/            # API service layer
├── context/             # React context providers
├── types/               # TypeScript type definitions (by feature)
├── constants/           # App constants (by feature)
├── utils/               # Utility functions
└── assets/              # Images, icons, etc.
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (Mac) or Android Studio

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment configuration:**
```bash
npm run setup-env
```

3. **Start the development server:**
```bash
npm start
```

4. **Run on device/simulator:**
```bash
# iOS Simulator
npm run ios

# Android Device/Emulator
npm run android

# Web Browser
npm run web

# Physical devices (Android/iOS) via tunnel
npm run dev:tunnel
```

## Configuration

### Environment Setup

#### Quick Setup (Recommended)

Run the automated environment setup:

```bash
npm run setup-env
```

This command will:
- 🔍 Automatically detect your computer's IP address
- 📝 Create `.env.local` with the correct configuration  
- ✅ Configure the app to work on both iOS simulator and Android devices
- 🚀 Get you ready to develop immediately

#### Manual Setup

If you prefer to configure manually:

1. **Copy the example environment file:**
```bash
cp .env.example .env.local
```

2. **Get your computer's IP address:**
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows  
ipconfig
```

3. **Update `.env.local` with your settings:**
```bash
# For local development with physical devices (Android/iOS via Expo Go)
EXPO_PUBLIC_API_BASE_URL=http://YOUR_COMPUTER_IP:3001

# For iOS simulator only (if you don't need Android device support)
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
```

### Environment Files

- `.env.example` - Template (committed to git)
- `.env.local` - Your local development config (gitignored)  
- `.env.production` - Production config (gitignored)

**Important:** Never commit `.env.local` or `.env.production` as they may contain secrets in the future.

### Network Requirements

**For Physical Devices (Android/iOS via Expo Go):**
- 📶 Your computer and mobile device **must be on the same WiFi network**
- 🏠 The network IP configuration (set by `npm run setup-env`) only works when both devices share the same local network
- 🌐 If on different networks, use tunnel mode: `npm run dev:tunnel` (slower but works across networks)

### App Configuration

Main app settings are in `src/constants/app.ts` and `app.json`.

## UI Design

### Color Scheme

- **Primary**: #FF6B35 (Orange for Share Cost button)
- **Secondary**: #6366F1 (Blue)
- **Success**: #10B981 (Green)
- **Card Headers**: Pastel colors for different sections
  - Balances: Light Yellow (#FEF3C7)
  - Shopping: Light Green (#D1FAE5)
  - Activity: Light Blue (#DBEAFE)

### Navigation

- **Bottom Tab Navigation**: Home, Share Cost (FAB), Profile
- **Stack Navigation**: For deeper flows like expense splitting
- **WhatsApp-style Home**: Sticky header with household info + card-based content

## Key Components

### Authentication
- Login/Register screens with form validation
- JWT token management with AsyncStorage
- Auto-login on app restart

### Home Screen
- Household header with avatar and member count
- Cards for Balances, Shopping List, Recent Activity
- Real-time updates (placeholder for WebSocket integration)

### Share Cost Flow
- Choose between shopping receipt split or manual expense
- Step-by-step expense splitting with preview
- Integration with shopping list items

### Profile Screen
- User profile management
- House list with join/create options
- Settings and preferences

## API Integration

All API calls go through `src/services/` with proper error handling:

- `authService.ts` - Authentication endpoints
- `api.ts` - Axios configuration with interceptors

Features:
- Automatic JWT token attachment
- Token refresh on 401 errors
- Request/response logging
- Offline handling (future)

## State Management

- **Authentication**: React Context (`AuthContext`)
- **Local Storage**: AsyncStorage for persistence
- **API State**: Individual service calls (can be upgraded to React Query)

## Deployment

### Build for Production

```bash
# Build for app stores
eas build --platform all

# Local builds
npm run build:ios
npm run build:android
```

### App Store Configuration

The app is configured for deployment to both iOS App Store and Google Play Store:

- Bundle ID: `com.roomiesync.app`
- App name: "RoomieSync"
- Required permissions: Camera, Photo Library (for receipts/profiles)

## Development

### Adding New Features

1. Create types in `src/types/[feature].ts`
2. Add constants in `src/constants/[feature].ts`
3. Implement API service in `src/services/[feature]Service.ts`
4. Create UI components in `src/components/`
5. Build screens in `src/screens/[feature]/`
6. Update navigation as needed

### Code Style

- Use TypeScript for all new code
- Follow React Native best practices
- Use feature-based organization
- Prefer functional components with hooks
- Extract constants and avoid magic numbers

## Future Enhancements

- [ ] Real-time updates with WebSocket
- [ ] Push notifications
- [ ] Receipt photo scanning with OCR
- [ ] Biometric authentication
- [ ] Dark mode support
- [ ] Internationalization
- [ ] Offline mode with sync
- [ ] Chat/messaging between roommates

## Contributing

1. Follow the existing code structure
2. Add types for all new features
3. Update this README for significant changes
4. Test on both iOS and Android before submitting

## API Documentation

The backend API documentation is available at `http://localhost:3001/api` when running the NestJS backend.
