// Cookie utility functions for iOS compatibility

// Cookie utility functions for iOS compatibility

/**
 * Set a cookie with specified name, value, and options
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {boolean} session - If true, creates session cookie (default: true)
 * @param {string} path - Cookie path (default: '/')
 */
export const setCookie = (name, value, session = true, path = '/') => {
  try {
    // Ensure value is a string and handle large JSON objects
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    // Check if we're on HTTPS to determine if we should use Secure flag
    const isHTTPS = window.location.protocol === 'https:';

    let cookieString = `${name}=${encodeURIComponent(stringValue)};path=${path}`;

    if (session) {
      // Session cookie - expires when browser/app is closed
      // For iOS compatibility, use SameSite=None with Secure for HTTPS, or SameSite=Lax for HTTP
      if (isHTTPS) {
        cookieString += ';SameSite=None;Secure';
      } else {
        cookieString += ';SameSite=Lax';
      }
    } else {
      // Persistent cookie with 30-day expiration
      const expires = new Date();
      expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000);
      cookieString += `;expires=${expires.toUTCString()}`;

      if (isHTTPS) {
        cookieString += ';SameSite=None;Secure';
      } else {
        cookieString += ';SameSite=Lax';
      }
    }

    document.cookie = cookieString;

    // Verify cookie was set (iOS sometimes silently fails)
    const verification = getCookie(name);
    if (!verification) {
      console.warn(`Cookie ${name} may not have been set properly on iOS`);
      // Fallback to localStorage for iOS if cookies fail
      if (typeof Storage !== 'undefined') {
        localStorage.setItem(`fallback_${name}`, stringValue);
      }
    }
  } catch (error) {
    console.error('Error setting cookie:', error);
    // Fallback to localStorage for iOS
    if (typeof Storage !== 'undefined') {
      localStorage.setItem(`fallback_${name}`, typeof value === 'string' ? value : JSON.stringify(value));
    }
  }
};

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
export const getCookie = name => {
  try {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }

    // Fallback to localStorage for iOS if cookie not found
    if (typeof Storage !== 'undefined') {
      const fallbackValue = localStorage.getItem(`fallback_${name}`);
      if (fallbackValue) {
        return fallbackValue;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting cookie:', error);
    // Fallback to localStorage for iOS
    if (typeof Storage !== 'undefined') {
      return localStorage.getItem(`fallback_${name}`);
    }
    return null;
  }
};

/**
 * Delete a cookie by name
 * @param {string} name - Cookie name
 * @param {string} path - Cookie path (default: '/')
 */
export const deleteCookie = (name, path = '/') => {
  try {
    // Delete the cookie
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=${path};`;

    // Also delete fallback localStorage entry
    if (typeof Storage !== 'undefined') {
      localStorage.removeItem(`fallback_${name}`);
    }
  } catch (error) {
    console.error('Error deleting cookie:', error);
    // Still try to delete fallback localStorage entry
    if (typeof Storage !== 'undefined') {
      localStorage.removeItem(`fallback_${name}`);
    }
  }
};

/**
 * Clear all workout-related cookies and fallback storage
 * Useful for iOS where document.cookie.split might not work reliably
 */
export const clearWorkoutCookies = () => {
  try {
    // Clear specific cookies
    const cookiesToClear = ['exerciseId', 'deleteId'];
    cookiesToClear.forEach(name => deleteCookie(name));

    // Clear workout session cookies
    if (typeof Storage !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('workout_session_') || key.startsWith('fallback_workout_session_')) {
          localStorage.removeItem(key);
        }
      });
    }

    // Try to clear from document.cookie as well
    const allCookies = document.cookie.split(';');
    allCookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name.startsWith('workout_session_') || name === 'deleteId') {
        deleteCookie(name);
      }
    });
  } catch (error) {
    console.error('Error clearing workout cookies:', error);
  }
};
