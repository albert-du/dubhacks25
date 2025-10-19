// Node.js script to create PWA icons using canvas
const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Create a colorful gradient background
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, '#86b19c');
  gradient.addColorStop(0.5, '#6ba085');
  gradient.addColorStop(1, '#4a6b5b');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Add a paintbrush icon
  ctx.strokeStyle = 'white';
  ctx.fillStyle = 'white';
  ctx.lineWidth = size * 0.05;
  ctx.lineCap = 'round';

  // Paintbrush handle
  const centerX = size / 2;
  const centerY = size / 2;
  const brushSize = size * 0.6;
  
  ctx.beginPath();
  ctx.moveTo(centerX - brushSize * 0.2, centerY + brushSize * 0.3);
  ctx.lineTo(centerX - brushSize * 0.3, centerY + brushSize * 0.4);
  ctx.stroke();

  // Brush tip
  ctx.beginPath();
  ctx.ellipse(centerX - brushSize * 0.1, centerY + brushSize * 0.1, 
             brushSize * 0.15, brushSize * 0.25, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  // Brush ferrule
  ctx.beginPath();
  ctx.rect(centerX - brushSize * 0.25, centerY + brushSize * 0.2, 
           brushSize * 0.1, brushSize * 0.15);
  ctx.fillStyle = '#c0c0c0';
  ctx.fill();

  // Paint palette
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.ellipse(centerX + brushSize * 0.1, centerY - brushSize * 0.1, 
             brushSize * 0.2, brushSize * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Color dots on palette
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'];
  colors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    const angle = (i * Math.PI) / 2;
    const x = centerX + brushSize * 0.1 + Math.cos(angle) * brushSize * 0.08;
    const y = centerY - brushSize * 0.1 + Math.sin(angle) * brushSize * 0.06;
    ctx.arc(x, y, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  });

  // Save the image
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`the-grounds/public/${filename}`, buffer);
  console.log(`Created ${filename} (${size}x${size})`);
}

// Create all required icons
createIcon(192, 'icon-192x192.png');
createIcon(512, 'icon-512x512.png');
createIcon(180, 'apple-touch-icon.png');

console.log('All PWA icons created successfully!');