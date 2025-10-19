from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    # Create image with gradient background
    img = Image.new('RGBA', (size, size), color=(134, 177, 156, 255))
    draw = ImageDraw.Draw(img)
    
    # Create a simple circular background with gradient effect
    for i in range(size//2):
        opacity = int(255 * (1 - i / (size//2)) * 0.3)
        color = (106, 160, 133, opacity)
        draw.ellipse([i, i, size-i, size-i], fill=color)
    
    # Draw a simple paintbrush icon
    center_x, center_y = size // 2, size // 2
    brush_size = size * 0.6
    
    # Brush handle (rectangle)
    handle_width = max(2, size // 20)
    handle_length = int(brush_size * 0.4)
    handle_x = center_x - handle_width // 2
    handle_y = center_y + int(brush_size * 0.1)
    draw.rectangle([handle_x, handle_y, handle_x + handle_width, handle_y + handle_length], 
                   fill=(139, 69, 19, 255))  # Brown handle
    
    # Brush ferrule (silver band)
    ferrule_height = max(2, size // 15)
    ferrule_y = handle_y - ferrule_height
    draw.rectangle([handle_x - 1, ferrule_y, handle_x + handle_width + 1, handle_y], 
                   fill=(192, 192, 192, 255))  # Silver
    
    # Brush tip (triangle/oval)
    tip_width = max(4, size // 8)
    tip_height = max(6, size // 6)
    tip_x = center_x - tip_width // 2
    tip_y = ferrule_y - tip_height
    draw.ellipse([tip_x, tip_y, tip_x + tip_width, ferrule_y], 
                 fill=(255, 255, 255, 255))  # White brush tip
    
    # Add some paint drops for color
    colors = [(255, 107, 107), (78, 205, 196), (69, 183, 209), (249, 202, 36)]
    for i, color in enumerate(colors):
        angle = i * 90
        x = center_x + int((brush_size * 0.3) * (1 if i % 2 == 0 else -1))
        y = center_y - int((brush_size * 0.2) * (1 if i < 2 else -1))
        drop_size = max(3, size // 25)
        draw.ellipse([x - drop_size, y - drop_size, x + drop_size, y + drop_size], 
                     fill=color)
    
    # Save the image
    output_path = os.path.join('the-grounds', 'public', filename)
    img.save(output_path, 'PNG')
    print(f'Created {filename} ({size}x{size})')

# Create all required icons
os.makedirs(os.path.join('the-grounds', 'public'), exist_ok=True)

create_icon(192, 'icon-192x192.png')
create_icon(512, 'icon-512x512.png') 
create_icon(180, 'apple-touch-icon.png')

print('All PWA icons created successfully!')