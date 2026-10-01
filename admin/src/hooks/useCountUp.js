import { useState, useEffect, useRef } from 'react';

/**
 * useCountUp hook for smooth, high-class financial & metric odometer rollups
 * @param {number} targetValue - The target number to animate to
 * @param {number} duration - Animation duration in ms (default 900ms)
 * @returns {number} current interpolated animated value
 */
export const useCountUp = (targetValue, duration = 900) => {
  const [count, setCount] = useState(0);
  const prevTargetRef = useRef(0);

  useEffect(() => {
    const startValue = prevTargetRef.current;
    const endValue = typeof targetValue === 'number' && !isNaN(targetValue) ? targetValue : 0;
    prevTargetRef.current = endValue;

    if (startValue === endValue) {
      setCount(endValue);
      return;
    }

    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic: 1 - pow(1 - progress, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(startValue + (endValue - startValue) * easeProgress);
      setCount(currentVal);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(endValue);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [targetValue, duration]);

  return count;
};

export default useCountUp;
