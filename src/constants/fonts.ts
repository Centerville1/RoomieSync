import { Platform } from "react-native";

// Define the icon font families we're using
export const ICON_FONTS = {
  Ionicons: "Ionicons",
  MaterialIcons: "MaterialIcons",
  MaterialCommunityIcons: "MaterialCommunityIcons",
  FontAwesome: "FontAwesome",
};

// Function to inject font styles for web
export const injectIconFontStyles = () => {
  if (Platform.OS === "web" && typeof document !== "undefined") {
    const style = document.createElement("style");
    style.type = "text/css";
    style.textContent = `
      @font-face {
        font-family: 'Ionicons';
        src: url('/fonts/Ionicons.ttf') format('truetype');
      }
      @font-face {
        font-family: 'MaterialIcons';
        src: url('/fonts/MaterialIcons.ttf') format('truetype');
      }
      @font-face {
        font-family: 'MaterialCommunityIcons';
        src: url('/fonts/MaterialCommunityIcons.ttf') format('truetype');
      }
      @font-face {
        font-family: 'FontAwesome';
        src: url('/fonts/FontAwesome.ttf') format('truetype');
      }
    `;
    document.head.appendChild(style);
  }
};
