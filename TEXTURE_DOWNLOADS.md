# Texture Download Guide

## Required Textures

You need to download 3 texture images and place them in `/public/textures/`. All textures are **CC0 licensed** (no attribution required, completely free).

---

## 1. Paper Grain Texture

**File name:** `paper-grain.jpg`
**Recommended size:** 512x512px
**Target file size:** 5-15KB
**Style:** Subtle, warm-toned, aged parchment grain

### Recommended Sources (Choose One)

#### Option A: Subtle Patterns (Easiest - Pre-optimized for web)
1. Visit: https://www.toptal.com/designers/subtlepatterns/
2. Search for: "paper" or "cardboard" or "subtle grunge"
3. Recommended patterns:
   - **"Paper"** - Classic subtle paper texture
   - **"Cardboard"** - Warm, organic grain
   - **"Subtle Grunge"** - Aged appearance
4. Download as PNG or JPG (they're already optimized)
5. Rename to `paper-grain.jpg`

#### Option B: CC0 Textures (High Quality)
1. Visit: https://cc0textures.com/list?q=paper
2. Look for: "Paper" category
3. Download: Pick a subtle paper texture
4. Download the **1K resolution** (1024x1024)
5. You'll need to optimize (see below)

#### Option C: Poly Haven
1. Visit: https://polyhaven.com/textures/paper
2. Search: "paper" or "cardboard"
3. Download: Select **1K resolution**
4. Choose the **Diffuse/Color** map only (not normal, roughness, etc.)
5. You'll need to optimize (see below)

---

## 2. Wood Grain Texture

**File name:** `wood-grain.jpg`
**Recommended size:** 256x256px
**Target file size:** 10-20KB
**Style:** Weathered coastal wood, visible grain, aged appearance

### Recommended Sources (Choose One)

#### Option A: ambientCG (Best for weathered wood)
1. Visit: https://ambientcg.com/list?category=&type=Material&sort=Popular&q=wood
2. Recommended materials:
   - **"Wood049"** - Weathered planks
   - **"Wood026"** - Painted weathered wood
   - **"PlanksWorn"** - Aged wood planks
3. Download settings:
   - Resolution: **1K** (1024x1024)
   - Format: **JPG**
   - Map type: **Color/Diffuse** only
4. You'll need to resize and optimize (see below)

#### Option B: Poly Haven
1. Visit: https://polyhaven.com/textures/wood
2. Search: "weathered" or "planks" or "old"
3. Recommended:
   - **"Weathered Planks"**
   - **"Old Wood"**
   - **"Painted Wood"**
4. Download: **1K resolution**, **Color/Diffuse map only**
5. You'll need to resize and optimize (see below)

#### Option C: TextureCan
1. Visit: https://www.texturecan.com/
2. Search: "weathered wood"
3. Download any seamless wood texture
4. You'll need to resize and optimize (see below)

---

## 3. Rope Texture

**File name:** `rope-texture.jpg`
**Recommended size:** 128x128px
**Target file size:** 10-15KB
**Style:** Natural hemp/sisal rope, coiled or woven

### Recommended Sources (Choose One)

#### Option A: ambientCG (Best - Dedicated Rope Textures)
1. Visit: https://ambientcg.com/view?id=Rope001
2. Recommended materials:
   - **"Rope001"** - https://ambientcg.com/view?id=Rope001
   - **"Rope002"** - https://ambientcg.com/view?id=Rope002
   - **"Rope003"** - https://ambientcg.com/view?id=Rope003
3. Download settings:
   - Resolution: **512** (512x512)
   - Format: **JPG**
   - Map type: **Color** only
4. You'll need to resize and optimize (see below)

#### Option B: Poly Haven
1. Visit: https://polyhaven.com/textures
2. Search: "rope" or "fabric"
3. Download: **512 resolution**, **Color/Diffuse map only**
4. You'll need to resize and optimize (see below)

---

## Optimization Instructions

If you download high-resolution textures (1K, 2K, 4K), you'll need to resize and compress them.

### Using Preview (Mac - Built-in)

1. Open the downloaded image in **Preview**
2. Go to **Tools → Adjust Size...**
3. Set dimensions:
   - Paper: 512 x 512 pixels
   - Wood: 256 x 256 pixels
   - Rope: 128 x 128 pixels
4. Ensure "Scale proportionally" is checked
5. Click **OK**
6. Go to **File → Export...**
7. Format: **JPEG**
8. Quality: Move slider to **70-85%**
9. Save to `/Users/kiranoliver/GitHub/foghorn/public/textures/`

### Using ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
# Resize and compress paper texture
convert input.jpg -resize 512x512 -quality 80 paper-grain.jpg

# Resize and compress wood texture
convert input.jpg -resize 256x256 -quality 80 wood-grain.jpg

# Resize and compress rope texture
convert input.jpg -resize 128x128 -quality 80 rope-texture.jpg
```

### Using Online Tools

1. **TinyPNG** (https://tinypng.com/)
   - Upload your texture
   - It will compress automatically
   - Download the result

2. **Squoosh** (https://squoosh.app/)
   - Upload texture
   - Resize to target dimensions
   - Adjust quality slider to 70-85%
   - Download

---

## Installation Steps

1. Download your chosen textures (or use the quick start below)
2. Resize and optimize them (if needed)
3. Place them in: `/Users/kiranoliver/GitHub/foghorn/public/textures/`
4. Ensure file names match exactly:
   - `paper-grain.jpg`
   - `wood-grain.jpg`
   - `rope-texture.jpg`
5. Start the dev server: `npm run dev`
6. Open http://localhost:5173/
7. Textures should now be visible!

---

## Quick Start (Recommended Path)

**Fastest route to get started:**

1. **Paper:** Subtle Patterns → "Paper" pattern → Already optimized
2. **Wood:** ambientCG → Wood049 → Download 1K Color map → Resize to 256x256
3. **Rope:** ambientCG → Rope001 → Download 512 Color map → Resize to 128x128

**Direct links:**
- Subtle Patterns Paper: https://www.toptal.com/designers/subtlepatterns/
- ambientCG Wood049: https://ambientcg.com/view?id=Wood049
- ambientCG Rope001: https://ambientcg.com/view?id=Rope001

---

## Verification Checklist

After placing textures, verify:

- [ ] Files are in `/public/textures/` directory
- [ ] File names are exactly: `paper-grain.jpg`, `wood-grain.jpg`, `rope-texture.jpg`
- [ ] File sizes: paper ~5-15KB, wood ~10-20KB, rope ~10-15KB
- [ ] Total all textures: <50KB
- [ ] Textures are seamless/tileable (no visible edges when repeated)
- [ ] Dev server shows textures (not CSS gradients)

---

## Troubleshooting

**Textures not showing up?**
1. Check file paths: `/public/textures/paper-grain.jpg` (exact spelling)
2. Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Check browser console for 404 errors
4. Ensure dev server restarted after adding textures

**Textures too strong/visible?**
1. Open `design-system/tokens.css`
2. Adjust opacity tokens:
   ```css
   --texture-opacity-subtle: 0.1;  /* Lower = more subtle */
   ```
3. Or reduce opacity in image editor before export

**Textures look pixelated?**
1. Download higher resolution (1K instead of 512)
2. Resize with better quality settings
3. Try different source (Poly Haven usually highest quality)

**Visible seams/edges?**
1. Ensure you downloaded "seamless" or "tileable" version
2. ambientCG and Poly Haven textures are always seamless
3. Test by viewing texture repeated 4x in image viewer

---

## Alternative: Use Placeholder Textures

If you want to test the implementation immediately without downloading:

I can generate simple noise-based textures using command-line tools. They won't be as authentic as photo-based textures, but they'll be better than CSS gradients and let you test the implementation.

Let me know if you want placeholder textures to start!

---

## License Information

All recommended sources provide **CC0 (Public Domain)** textures:
- ✅ No attribution required
- ✅ Free for commercial use
- ✅ Can modify freely
- ✅ No restrictions

**Sources:**
- Subtle Patterns: Creative Commons CC BY-SA 3.0 (attribution appreciated but not required)
- ambientCG: CC0 Public Domain
- Poly Haven: CC0 Public Domain
- CC0 Textures: CC0 Public Domain

---

**Questions?** Let me know if you need help downloading, optimizing, or troubleshooting!
