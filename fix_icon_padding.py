#!/usr/bin/env python3
"""
Fix macOS app icon padding according to Apple HIG.
macOS icons should have ~10% padding (artwork at ~80% of canvas).
"""

from PIL import Image
import os
import shutil

ICONS_DIR = "src-tauri/icons"

# macOS HIG: artwork should be ~80% of canvas size
ARTWORK_RATIO = 0.80

def add_padding_to_icon(source_img, output_path, target_size):
    """Add proper padding to icon for macOS HIG compliance."""
    # Calculate artwork size (80% of target)
    artwork_size = int(target_size * ARTWORK_RATIO)
    
    # Resize artwork from source
    img_resized = source_img.resize((artwork_size, artwork_size), Image.Resampling.LANCZOS)
    
    # Create new canvas with transparency
    canvas = Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))
    
    # Center the artwork
    offset = (target_size - artwork_size) // 2
    canvas.paste(img_resized, (offset, offset), img_resized)
    
    canvas.save(output_path, "PNG")
    print(f"  Created {output_path} ({target_size}x{target_size})")

def main():
    source_path = os.path.join(ICONS_DIR, "icon.png")
    backup_path = os.path.join(ICONS_DIR, "icon_original.png")
    
    if not os.path.exists(source_path):
        print(f"Source icon not found: {source_path}")
        return
    
    # Backup original if not already done
    if not os.path.exists(backup_path):
        shutil.copy(source_path, backup_path)
        print(f"Backed up original to {backup_path}")
    
    # Load the ORIGINAL (unpadded) source
    source_img = Image.open(backup_path).convert("RGBA")
    print(f"Source: {backup_path} ({source_img.width}x{source_img.height})")
    print(f"Adding {int((1-ARTWORK_RATIO)*100)}% padding for macOS HIG compliance...")
    print()
    
    # Icon sizes needed for Tauri
    sizes = {
        "32x32.png": 32,
        "64x64.png": 64,
        "128x128.png": 128,
        "128x128@2x.png": 256,
        "icon.png": 512,
        # Windows/Store logos
        "Square30x30Logo.png": 30,
        "Square44x44Logo.png": 44,
        "Square71x71Logo.png": 71,
        "Square89x89Logo.png": 89,
        "Square107x107Logo.png": 107,
        "Square142x142Logo.png": 142,
        "Square150x150Logo.png": 150,
        "Square284x284Logo.png": 284,
        "Square310x310Logo.png": 310,
        "StoreLogo.png": 50,
    }
    
    for filename, size in sizes.items():
        output_path = os.path.join(ICONS_DIR, filename)
        add_padding_to_icon(source_img, output_path, size)
    
    # Generate .icns for macOS (requires specific sizes)
    print()
    print("Generating icon.icns for macOS...")
    generate_icns(source_img)
    
    print()
    print("Done! Rebuild the app to see changes.")

def generate_icns(source_img):
    """Generate macOS .icns file with proper sizes."""
    try:
        import struct
        import io
        
        # macOS .icns requires these specific sizes
        icns_sizes = [16, 32, 64, 128, 256, 512, 1024]
        
        icons = {}
        for size in icns_sizes:
            artwork_size = int(size * ARTWORK_RATIO)
            img_resized = source_img.resize((artwork_size, artwork_size), Image.Resampling.LANCZOS)
            canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
            offset = (size - artwork_size) // 2
            canvas.paste(img_resized, (offset, offset), img_resized)
            
            # Save as PNG bytes
            buf = io.BytesIO()
            canvas.save(buf, "PNG")
            icons[size] = buf.getvalue()
        
        # Build .icns file
        # icns format: 'icns' header, then icon entries
        icns_types = {
            16: b'icp4',   # 16x16
            32: b'icp5',   # 32x32  
            64: b'icp6',   # 64x64
            128: b'ic07',  # 128x128
            256: b'ic08',  # 256x256
            512: b'ic09',  # 512x512
            1024: b'ic10', # 1024x1024
        }
        
        data = b''
        for size, icon_type in icns_types.items():
            if size in icons:
                png_data = icons[size]
                entry = icon_type + struct.pack('>I', len(png_data) + 8) + png_data
                data += entry
        
        icns_data = b'icns' + struct.pack('>I', len(data) + 8) + data
        
        icns_path = os.path.join(ICONS_DIR, "icon.icns")
        with open(icns_path, 'wb') as f:
            f.write(icns_data)
        print(f"  Created {icns_path}")
        
    except Exception as e:
        print(f"  Warning: Could not generate .icns: {e}")
        print("  You may need to regenerate it manually on macOS")

if __name__ == "__main__":
    main()
