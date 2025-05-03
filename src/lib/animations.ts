/**
 * Simple animation utility for micro-interactions
 * Provides a reusable set of animations and transitions for UI elements
 */

// Animation timing presets
export const timings = {
  fast: 150,
  medium: 300,
  slow: 500,
  bounce: [300, 100, 100] // initial, overshoot, settle
};

// Vibration patterns for haptic feedback
export const vibrationPatterns = {
  success: [15],
  warning: [20, 30, 20],
  error: [50, 100, 50],
  conversion: [10, 20, 10]
};

/**
 * Trigger haptic feedback if supported by the device
 * @param pattern Vibration pattern in milliseconds
 * @returns True if vibration was triggered, false if unsupported
 */
export const vibrate = (pattern: number[]): boolean => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
      return true;
    } catch (e) {
      console.warn('Vibration failed:', e);
      return false;
    }
  }
  return false;
};

/**
 * Apply a temporary animation class to an element and remove it after completion
 * @param element Target DOM element
 * @param animationClass CSS class containing the animation
 * @param duration Animation duration in ms
 * @returns Promise that resolves when animation completes
 */
export const animateElement = (
  element: HTMLElement,
  animationClass: string,
  duration = timings.medium
): Promise<void> => {
  return new Promise((resolve) => {
    element.classList.add(animationClass);
    
    const cleanup = () => {
      element.classList.remove(animationClass);
      resolve();
    };
    
    setTimeout(cleanup, duration);
  });
};

/**
 * Create a spring-like bounce animation on an element
 * @param element Target DOM element
 * @param scale Scale factor for the bounce (1.0 = no change)
 * @returns Promise that resolves when animation completes
 */
export const bounceElement = (
  element: HTMLElement,
  scale = 1.05
): Promise<void> => {
  const originalTransform = element.style.transform;
  const [initial, overshoot, settle] = timings.bounce;
  const totalDuration = initial + overshoot + settle;
  
  return new Promise((resolve) => {
    // Initial expansion
    element.style.transform = `${originalTransform} scale(${scale})`;
    element.style.transition = `transform ${initial}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
    
    setTimeout(() => {
      // Slight overshoot in the opposite direction
      element.style.transform = `${originalTransform} scale(${1 - (scale - 1) / 3})`;
      element.style.transition = `transform ${overshoot}ms cubic-bezier(0.6, -0.28, 0.735, 0.045)`;
      
      setTimeout(() => {
        // Settle back to normal
        element.style.transform = originalTransform;
        element.style.transition = `transform ${settle}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`;
        
        setTimeout(() => {
          // Cleanup and resolve
          element.style.transition = '';
          resolve();
        }, settle);
      }, overshoot);
    }, initial);
  });
};

/**
 * Animate content replacement with a fade transition
 * @param element Container element
 * @param newContent New content to display
 * @param isHTML Whether the content is HTML
 * @returns Promise that resolves when animation completes
 */
export const fadeContent = (
  element: HTMLElement,
  newContent: string,
  isHTML = false
): Promise<void> => {
  return new Promise((resolve) => {
    // Fade out
    element.style.opacity = '0';
    element.style.transition = `opacity ${timings.fast}ms ease-out`;
    
    setTimeout(() => {
      // Update content
      if (isHTML) {
        element.innerHTML = newContent;
      } else {
        element.textContent = newContent;
      }
      
      // Fade in
      element.style.opacity = '1';
      
      setTimeout(() => {
        // Cleanup and resolve
        element.style.transition = '';
        resolve();
      }, timings.fast);
    }, timings.fast);
  });
};

/**
 * Create a pulse effect on success (commonly used after conversion)
 * @param element Element to animate
 * @param color Success color (default: green)
 * @returns Promise that resolves when animation completes
 */
export const successPulse = (
  element: HTMLElement,
  color = 'rgba(34, 197, 94, 0.2)'
): Promise<void> => {
  const originalBackground = element.style.backgroundColor;
  const duration = timings.medium;
  
  return new Promise((resolve) => {
    // Add box shadow and background glow
    element.style.backgroundColor = color;
    element.style.boxShadow = `0 0 8px ${color}`;
    element.style.transition = `all ${duration}ms ease-out`;
    
    // Vibrate if supported
    vibrate(vibrationPatterns.success);
    
    setTimeout(() => {
      // Return to original state
      element.style.backgroundColor = originalBackground;
      element.style.boxShadow = '';
      
      setTimeout(() => {
        // Cleanup and resolve
        element.style.transition = '';
        resolve();
      }, duration);
    }, duration);
  });
};

/**
 * Create SVG path animations
 * @param svgElement SVG element containing paths to animate
 * @returns Promise that resolves when animation completes
 */
export const animateSVGPaths = (svgElement: SVGElement): Promise<void> => {
  const paths = svgElement.querySelectorAll('path');
  const duration = paths.length * timings.fast;
  
  // Prepare all paths
  paths.forEach(path => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    path.style.opacity = '1';
  });
  
  return new Promise((resolve) => {
    // Animate each path sequentially
    paths.forEach((path, index) => {
      setTimeout(() => {
        path.style.transition = `stroke-dashoffset ${timings.medium}ms ease-in-out`;
        path.style.strokeDashoffset = '0';
      }, index * (timings.fast / 2));
    });
    
    // Resolve when all animations complete
    setTimeout(resolve, duration);
  });
}; 