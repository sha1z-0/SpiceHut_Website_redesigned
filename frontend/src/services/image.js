// Resolve image source - handles Cloudinary URLs, local backend uploads, relative paths, and fallbacks
export function resolveImageSrc(img, fallback = '/media/home.webp') {
  const safeFallback = (!fallback || fallback === '/default-category.jpg' || fallback === '/home.jpg')
    ? '/media/home.webp'
    : fallback;

  if (!img) return safeFallback;
  if (typeof img !== 'string') return safeFallback;

  const trimmed = img.trim();
  if (!trimmed) return safeFallback;
  if (trimmed === '/default-category.jpg' || trimmed === '/home.jpg' || trimmed === 'default-category.jpg' || trimmed === 'home.jpg') {
    return safeFallback;
  }

  // Cloudinary URLs (https://res.cloudinary.com/...)
  if (trimmed.startsWith('https://res.cloudinary.com')) {
    if (!trimmed.includes('f_auto') && trimmed.includes('/upload/')) {
      return trimmed.replace('/upload/', '/upload/f_auto,q_auto,w_800,c_limit/');
    }
    return trimmed;
  }

  // Data URLs
  if (trimmed.startsWith('data:')) return trimmed;

  // Full HTTP/HTTPS URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

  // Determine backend origin for local uploads
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const serverOrigin = isLocal ? 'http://localhost:5000' : `${window.location.protocol}//${window.location.hostname}`;

  if (trimmed.startsWith('/api/uploads/')) {
    return `${serverOrigin}${trimmed}`;
  }
  if (trimmed.startsWith('api/uploads/')) {
    return `${serverOrigin}/${trimmed}`;
  }
  if (trimmed.startsWith('/uploads/')) {
    return `${serverOrigin}/api${trimmed}`;
  }
  if (trimmed.startsWith('uploads/')) {
    return `${serverOrigin}/api/${trimmed}`;
  }
  if (/^[^\s/]+\.[a-z]{2,4}$/i.test(trimmed)) {
    // Plain filename e.g. 1760904273751-imageFile.jpg
    return `${serverOrigin}/api/uploads/${trimmed}`;
  }
  if (trimmed.startsWith('/')) {
    return trimmed; // Static public asset e.g. /media/butter-chicken.webp
  }

  return safeFallback;
}
