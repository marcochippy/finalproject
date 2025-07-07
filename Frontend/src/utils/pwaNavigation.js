// PWA Navigation Hook for iOS compatibility
import { useNavigate as useReactRouterNavigate } from 'react-router';
import { isPWA, isIOS } from './iosUtils';

/**
 * Enhanced navigation hook that ensures navigation stays within PWA on iOS
 */
export const useNavigate = () => {
  const navigate = useReactRouterNavigate();

  const pwaNavigate = (to, options = {}) => {
    if (isIOS() && isPWA()) {
      // For iOS PWA, use replace by default to prevent Safari opening
      const navigationOptions = {
        replace: false,
        ...options
      };

      // Ensure we stay within the PWA context
      if (typeof to === 'string' && to.startsWith('http')) {
        // External URLs - stay in PWA
        window.location.href = to;
        return;
      }

      // Internal navigation - use React Router
      navigate(to, navigationOptions);
    } else {
      // Standard navigation for non-iOS or non-PWA
      navigate(to, options);
    }
  };

  return pwaNavigate;
};

/**
 * Enhanced Link component that prevents Safari opening in iOS PWA
 */
export const PWALink = ({ to, children, className, onClick, ...props }) => {
  const navigate = useNavigate();

  const handleClick = e => {
    if (isIOS() && isPWA()) {
      e.preventDefault();

      if (onClick) {
        onClick(e);
      }

      navigate(to);
    } else {
      // Let the default link behavior handle it
      if (onClick) {
        onClick(e);
      }
    }
  };

  if (isIOS() && isPWA()) {
    // Render as button for PWA to prevent Safari opening
    return (
      <button className={className} onClick={handleClick} {...props}>
        {children}
      </button>
    );
  }

  // Render as regular link for non-PWA
  return (
    <a href={to} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};
