# RoomieSync Test Deployment

## Building Test Apps

### Android
```bash
eas build --platform android --profile development
```
- Generates APK file
- Direct installation without app store

### iOS
```bash
eas build --platform ios --profile development
```
- Generates TestFlight link or IPA file
- Requires Apple Developer account

## Installing on Devices

### Android
1. Download APK from build link
2. Enable "Install from Unknown Sources" in device settings
3. Install APK file
4. Open "RoomieSync (development)" app

### iOS
1. Install TestFlight app from App Store
2. Click TestFlight invitation link from build
3. Install app through TestFlight

## Updating Builds

### Quick Updates (JS changes only)
```bash
eas update --branch development
```

### Full Rebuild (native changes)
```bash
eas build --platform android --profile development
eas build --platform ios --profile development
```

## Build Management
```bash
eas build:list          # View all builds
eas build:view [ID]     # View specific build
eas build:cancel [ID]   # Cancel running build
```