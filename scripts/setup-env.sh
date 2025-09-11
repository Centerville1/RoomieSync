#!/bin/bash

echo "🏠 RoomieSync Environment Setup"
echo "================================"

# Get local IP address
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')

if [ -z "$LOCAL_IP" ]; then
    echo "❌ Could not detect local IP address"
    echo "Please manually set EXPO_PUBLIC_API_BASE_URL in .env.local"
    exit 1
fi

echo "📡 Detected local IP: $LOCAL_IP"

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local..."
    cp .env.example .env.local
    
    # Update the IP address in .env.local
    sed -i.bak "s/localhost/$LOCAL_IP/g" .env.local
    rm .env.local.bak
    
    echo "✅ Created .env.local with IP: $LOCAL_IP"
else
    echo "⚠️  .env.local already exists"
    echo "Current API URL: $(grep EXPO_PUBLIC_API_BASE_URL .env.local)"
    
    read -p "Update IP address to $LOCAL_IP? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sed -i.bak "s/EXPO_PUBLIC_API_BASE_URL=.*/EXPO_PUBLIC_API_BASE_URL=http:\/\/$LOCAL_IP:3001/g" .env.local
        rm .env.local.bak
        echo "✅ Updated .env.local with new IP: $LOCAL_IP"
    fi
fi

echo ""
echo "🚀 Setup complete!"
echo "Your app will now work on both iOS simulator and Android devices"
echo ""
echo "Next steps:"
echo "1. Make sure your NestJS backend is running on port 3001"
echo "2. Start Expo: npm start"
echo "3. Test on both iOS and Android"