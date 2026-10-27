import { useState, useRef, useCallback, TouchEvent } from 'react';

interface UseSwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  canSwipeLeft?: boolean;
  canSwipeRight?: boolean;
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  threshold = 60,
  canSwipeLeft = true,
  canSwipeRight = true,
}: UseSwipeGestureOptions) {
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const isGestureActive = useRef<boolean>(false);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const isSliderOrInteractive = (target: EventTarget | null): boolean => {
    if (!target || !(target instanceof HTMLElement)) return false;
    return Boolean(
      target.closest(
        'input[type="range"], [role="slider"], [data-no-swipe="true"], .eq-slider, .fluid-slider, audio, video'
      )
    );
  };

  const handleTouchStart = useCallback((e: TouchEvent<HTMLElement>) => {
    if (e.touches.length !== 1) return;
    const target = e.target;

    // Check if the touch originated on a slider or fader control
    if (isSliderOrInteractive(target)) {
      isGestureActive.current = false;
      return;
    }

    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    isGestureActive.current = true;
    isHorizontalSwipe.current = null;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLElement>) => {
    if (!isGestureActive.current || e.touches.length !== 1) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    // Determine direction intent on first significant movement (> 8px)
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          isHorizontalSwipe.current = true;
          setIsDragging(true);
        } else {
          // Native vertical scrolling takes precedence
          isHorizontalSwipe.current = false;
          isGestureActive.current = false;
          setIsDragging(false);
          setDragOffset(0);
          return;
        }
      } else {
        return;
      }
    }

    if (isHorizontalSwipe.current) {
      // Apply rubber-banding resistance at boundaries
      let effectiveDeltaX = deltaX;
      if (deltaX < 0 && !canSwipeLeft) {
        effectiveDeltaX = deltaX * 0.2;
      } else if (deltaX > 0 && !canSwipeRight) {
        effectiveDeltaX = deltaX * 0.2;
      }

      setDragOffset(effectiveDeltaX);
    }
  }, [canSwipeLeft, canSwipeRight]);

  const handleTouchEnd = useCallback(() => {
    if (!isGestureActive.current || isHorizontalSwipe.current !== true) {
      isGestureActive.current = false;
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    const duration = Date.now() - touchStartTime.current;
    const velocity = Math.abs(dragOffset) / (duration || 1); // px per ms

    // Trigger swipe if exceeded threshold or quick flick (> 0.4 px/ms and > 30px)
    const isFlick = velocity > 0.4 && Math.abs(dragOffset) > 30;
    const isPastThreshold = Math.abs(dragOffset) >= threshold;

    if (isFlick || isPastThreshold) {
      if (dragOffset < 0 && canSwipeLeft) {
        onSwipeLeft?.();
      } else if (dragOffset > 0 && canSwipeRight) {
        onSwipeRight?.();
      }
    }

    // Reset gesture state
    isGestureActive.current = false;
    setIsDragging(false);
    setDragOffset(0);
  }, [dragOffset, threshold, canSwipeLeft, canSwipeRight, onSwipeLeft, onSwipeRight]);

  const handleTouchCancel = useCallback(() => {
    isGestureActive.current = false;
    setIsDragging(false);
    setDragOffset(0);
  }, []);

  return {
    dragOffset,
    isDragging,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
  };
}
