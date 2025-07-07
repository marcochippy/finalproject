// iOS Detection and Compatibility Utilities

/**
 * Detect if the user is on iOS
 */
export const isIOS = () => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

/**
 * Detect if the app is running as a PWA (added to home screen)
 */
export const isPWA = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
};

/**
 * Detect if the user is on iOS Safari
 */
export const isIOSSafari = () => {
  const ua = navigator.userAgent;
  return isIOS() && /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/.test(ua);
};

/**
 * Check if cookies are supported and working
 */
export const cookiesSupported = () => {
  try {
    document.cookie = 'test=1;path=/';
    const supported = document.cookie.indexOf('test=1') !== -1;
    document.cookie = 'test=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
    return supported;
  } catch (e) {
    return false;
  }
};

/**
 * Setup iOS specific configurations
 */
export const setupIOSCompatibility = () => {
  if (!isIOS()) return;

  // Prevent iOS Safari from caching pages aggressively
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      window.location.reload();
    }
  });

  // Prevent viewport scaling on input focus
  const addMaximumScaleToMetaViewport = () => {
    const el = document.querySelector('meta[name=viewport]');
    if (el !== null) {
      let content = el.getAttribute('content');
      let re = /maximum\-scale=[0-9\.]+/g;
      if (re.test(content)) {
        content = content.replace(re, 'maximum-scale=1.0');
      } else {
        content = [content, 'maximum-scale=1.0'].join(', ');
      }
      el.setAttribute('content', content);
    }
  };

  const disableIosTextFieldZoom = addMaximumScaleToMetaViewport;

  // Handle input focus/blur events
  const inputs = document.querySelectorAll(
    'input[type="text"], input[type="number"], input[type="email"], input[type="password"], textarea'
  );
  inputs.forEach(input => {
    input.addEventListener('focus', disableIosTextFieldZoom, false);
    input.addEventListener(
      'blur',
      () => {
        const el = document.querySelector('meta[name=viewport]');
        if (el !== null) {
          let content = el.getAttribute('content');
          content = content.replace(/maximum\-scale=[0-9\.]+/g, 'maximum-scale=10.0');
          el.setAttribute('content', content);
        }
      },
      false
    );
  });

  // iOS PWA status bar handling
  if (isPWA()) {
    document.body.classList.add('ios-pwa');

    // Add safe area classes to root elements
    document.documentElement.classList.add('ios-safe-area');
  }
};

/**
 * iOS specific storage fallback
 */
export const getIOSCompatibleStorage = () => {
  if (cookiesSupported()) {
    return 'cookies';
  } else if (typeof Storage !== 'undefined') {
    return 'localStorage';
  } else {
    return 'memory';
  }
};

/**
 * Prevent PWA links from opening in Safari
 */
export const preventPWALinkEscape = () => {
  if (!isPWA()) return;

  // Override all anchor clicks to prevent Safari opening
  document.addEventListener(
    'click',
    e => {
      const anchor = e.target.closest('a');
      if (anchor && anchor.href) {
        const url = new URL(anchor.href);
        const currentUrl = new URL(window.location.href);

        // If it's the same domain, prevent default and use history API
        if (url.origin === currentUrl.origin) {
          e.preventDefault();
          window.history.pushState({}, '', anchor.href);

          // Trigger a popstate event to make React Router handle the navigation
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      }
    },
    true
  );

  // Handle browser back/forward in PWA
  window.addEventListener('popstate', e => {
    if (isPWA()) {
      // Let React Router handle the navigation
      window.location.href = window.location.href;
    }
  });
};

/**
 * Fix iOS PWA navigation issues
 */
export const fixIOSPWANavigation = () => {
  if (!isIOS() || !isPWA()) return;

  // Prevent external navigation in PWA
  preventPWALinkEscape();

  // Override window.open in PWA to stay in app
  const originalOpen = window.open;
  window.open = function (url, target, features) {
    if (isPWA() && target === '_blank') {
      // Instead of opening in new window, navigate in current window
      window.location.href = url;
      return null;
    }
    return originalOpen.call(this, url, target, features);
  };

  // Override location changes to stay in PWA
  const originalAssign = window.location.assign;
  window.location.assign = function (url) {
    if (isPWA()) {
      window.location.href = url;
    } else {
      originalAssign.call(this, url);
    }
  };
};

// Initialize iOS compatibility on load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    setupIOSCompatibility();
    fixIOSPWANavigation();
  });
}
