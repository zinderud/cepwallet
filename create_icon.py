#!/usr/bin/env python3
from PIL import Image, ImageDraw

# 512x512 RGBA icon oluştur
img = Image.new('RGBA', (512, 512), (74, 144, 226, 255))

# Basit "C" harfi çiz
draw = ImageDraw.Draw(img)
draw.text((200, 200), "C", fill=(255, 255, 255, 255))

img.save('src-tauri/icons/icon.png')
print("Icon created successfully!")
