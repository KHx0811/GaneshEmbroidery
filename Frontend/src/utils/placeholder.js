export const generatePlaceholderImage = (width = 300, height = 200, text = 'No Image') => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);
  
  ctx.strokeStyle = '#ddd';
  ctx.strokeRect(0, 0, width, height);
  
  ctx.fillStyle = '#999';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(text, width / 2, height / 2);
  
  return canvas.toDataURL();
};

export const defaultPlaceholder = 'data:image/svg+xml;base64,' + btoa(`
  <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f0f0f0"/>
    <rect x="1" y="1" width="298" height="198" fill="none" stroke="#ddd" stroke-width="2"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#999" text-anchor="middle" dy=".3em">No Image Available</text>
  </svg>
`);
