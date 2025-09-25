# Profile Image Setup Instructions

## Copy Profile Image
Run this command to copy your Memoji avatar to the portfolio:

```bash
cp "/Users/kushagrasikka/Documents/Screenshot 2025-09-25 at 7.33.07 PM.png" /Users/kushagrasikka/Desktop/Businesses/Portfolio_website_for_clients/anusha/assets/PIC.jpg
```

## Alternative Method
If the above doesn't work due to permissions:

1. Manually copy the file from Documents folder
2. Rename it to `PIC.jpg`
3. Place it in `/Users/kushagrasikka/Desktop/Businesses/Portfolio_website_for_clients/anusha/assets/`

## Optimize Image for Web
After copying, optimize the image:

```bash
cd /Users/kushagrasikka/Desktop/Businesses/Portfolio_website_for_clients/anusha/assets/
magick PIC.jpg -resize 800x800 -quality 85 -strip PIC_optimized.jpg
mv PIC_optimized.jpg PIC.jpg
```

## Commit Changes
After the image is in place:

```bash
cd /Users/kushagrasikka/Desktop/Businesses/Portfolio_website_for_clients/anusha/
git add assets/PIC.jpg
git commit -m "Add professional profile photo for Anusha"
git push origin main
```

The image looks perfect for a professional GenAI specialist portfolio - modern, friendly, and appropriate for job applications!