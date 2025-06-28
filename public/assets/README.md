# Assets Organization

This folder contains all static assets for the Super Mario AI Boardroom application.

## Folder Structure

### `/characters/`
Profile photos for the AI characters:
- `peach-profile.jpg` - Princess Peach (Marketing Director) profile photo
- `bowser-profile.jpg` - Bowser (Engineering Lead) profile photo  
- `luigi-profile.jpg` - Luigi (Personal Assistant) profile photo

*Note: These photos display when characters are not speaking (like Zoom muted state). When speaking, animated emoji avatars are shown instead.*

### `/backgrounds/`
Background images and textures:
- `mario-bg.png` - Main Mario world background image used in the app

### `/placeholders/`
Placeholder/example images (not used in the app):
- Various placeholder images for development reference

## Usage in Code

All assets are referenced from the `/public` root, so use paths like:
- `/assets/characters/peach-profile.jpg`
- `/assets/backgrounds/mario-bg.png`

## Adding New Assets

When adding new character photos or other assets:
1. Place them in the appropriate subfolder
2. Update the character definitions in `app/page.tsx`
3. Ensure images are optimized for web (compressed, appropriate size)
4. Use consistent naming conventions (lowercase with hyphens) 