# Chrome Extension Icons

This folder contains the required icons for the Chrome extension in different sizes:

## Required Icon Sizes:
- **icon16.png** - 16x16 pixels (toolbar icon, small displays)
- **icon48.png** - 48x48 pixels (extension management page)
- **icon128.png** - 128x128 pixels (Chrome Web Store, installation)

## Design Guidelines:
- **Style**: Modern gradient background with lower third and brand elements
- **Colors**: Purple/blue gradient (#667eea to #764ba2)
- **Elements**: 
  - Lower third bar at bottom (representing the main feature)
  - Brand circle in top-right (representing brand overlay feature)
  - Clean, professional appearance

## Converting SVG to PNG:
You can use the provided `icon-template.svg` to generate PNG icons:

### Online Converters:
1. **Canva** - Upload SVG and resize to required dimensions
2. **GIMP** - Open SVG, scale to size, export as PNG
3. **Inkscape** - Professional vector graphics editor
4. **Online SVG to PNG converters**

### Command Line (if you have ImageMagick):
```bash
# Convert SVG to different PNG sizes
magick convert icon-template.svg -resize 16x16 icon16.png
magick convert icon-template.svg -resize 48x48 icon48.png
magick convert icon-template.svg -resize 128x128 icon128.png
```

### Photoshop/Design Tools:
1. Import the SVG at 128x128 resolution
2. Create copies and resize to 48x48 and 16x16
3. Ensure crisp edges and readable elements at smaller sizes
4. Export as PNG with transparency

## Design Notes:
- The icon represents both main features (lower thirds and brand overlay)
- Uses the same color scheme as the extension themes
- Maintains clarity at all required sizes
- Professional appearance suitable for Chrome Web Store

## Files to Create:
- Replace this README with actual PNG files:
  - icon16.png (16x16 pixels)
  - icon48.png (48x48 pixels) 
  - icon128.png (128x128 pixels)
