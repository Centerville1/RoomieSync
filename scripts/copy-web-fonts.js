const fs = require("fs-extra");
const path = require("path");

async function copyFonts() {
  const fontsDir = path.join(
    __dirname,
    "../node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts"
  );
  const webFontsDir = path.join(__dirname, "../web-build/fonts");

  try {
    // Create fonts directory if it doesn't exist
    await fs.ensureDir(webFontsDir);

    // Copy all font files
    const fontFiles = await fs.readdir(fontsDir);
    for (const file of fontFiles) {
      if (file.endsWith(".ttf")) {
        await fs.copy(path.join(fontsDir, file), path.join(webFontsDir, file));
      }
    }

    console.log("✅ Fonts copied successfully");
  } catch (err) {
    console.error("Error copying fonts:", err);
    process.exit(1);
  }
}

copyFonts();
