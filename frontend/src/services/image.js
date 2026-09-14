// Resolve image source - handles Cloudinary URLs, local backend uploads, relative paths, and fallbacks
export function resolveImageSrc(img, fallback = '/media/home.webp') {
  const safeFallback = (!fallback || fallback === '/default-category.jpg' || fallback === '/home.jpg')
    ? '/media/home.webp'
    : fallback;

  if (!img) return safeFallback;
  if (typeof img !== 'string') return safeFallback;

  let trimmed = img.trim();
  if (!trimmed) return safeFallback;
  if (trimmed === '/default-category.jpg' || trimmed === '/home.jpg' || trimmed === 'default-category.jpg' || trimmed === 'home.jpg') {
    return safeFallback;
  }

  // Strip hardcoded development localhost URLs stored in database
  if (trimmed.includes('localhost:5000') || trimmed.includes('127.0.0.1:5000')) {
    trimmed = trimmed.replace(/^https?:\/\/(localhost|127\.0\.0\.1):5000/, '');
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

  // Other full HTTP/HTTPS URLs (external images)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

  // Determine backend origin for local uploads safely
  const getBackendOrigin = () => {
    let envApiUrl = '';
    // Use try-catch and typeof checks to prevent any build/runtime crashes
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
        envApiUrl = import.meta.env.VITE_API_BASE_URL;
      }
    } catch (e) {
      // Ignore
    }

    if (envApiUrl) {
      try {
        const u = new URL(envApiUrl, typeof window !== 'undefined' ? window.location.href : 'http://localhost:5000');
        return u.origin;
      } catch {
        return envApiUrl.replace(/\/api\/?$/, '');
      }
    }
    
    // Fallback if VITE_API_BASE_URL is not provided
    const isBrowser = typeof window !== 'undefined';
    const isLocal = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    return isBrowser 
      ? (isLocal ? 'http://localhost:5000' : `${window.location.protocol}//${window.location.host}`)
      : (process.env.VITE_API_BASE_URL || '');
  };
  const serverOrigin = getBackendOrigin();

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

// Smart helper to get dish image with fallback based on dish name/category
export function getDishImage(dish) {
  if (dish?.image && typeof dish.image === 'string' && dish.image.trim()) {
    const resolved = resolveImageSrc(dish.image, null);
    if (resolved && resolved !== '/media/home.webp' && !resolved.endsWith('null')) {
      return resolved;
    }
  }
  const nameLower = (dish?.name || '').toLowerCase();
  const catLower = (dish?.category || '').toLowerCase();
  if (nameLower.includes('butter') || catLower.includes('butter')) return '/butter-chicken.webp';
  if (nameLower.includes('biryani') || catLower.includes('biryani') || nameLower.includes('rice')) return '/Biryani.webp';
  if (nameLower.includes('tandoori') || catLower.includes('tandoori') || nameLower.includes('tikka')) return '/Tandoori-Chicken-Tikka.webp';
  if (nameLower.includes('korma') || catLower.includes('korma') || nameLower.includes('lamb') || nameLower.includes('curry')) return '/korma.webp';
  return '/butter-chicken.webp';
}
