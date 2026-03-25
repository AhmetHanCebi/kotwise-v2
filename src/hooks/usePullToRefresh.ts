import { useState, useRef, useCallback } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
}

export function usePullToRefresh({ onRefresh, threshold = 80 }: PullToRefreshOptions) {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    // Only activate if scrolled to top
    const target = e.currentTarget as HTMLElement;
    if (target.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }, []);

  const onTouchMove = useCallback((_e: React.TouchEvent) => {
    // Just tracking — actual trigger happens on touchEnd
  }, []);

  const onTouchEnd = useCallback(
    async (e: React.TouchEvent) => {
      if (!pulling.current || refreshing) return;
      pulling.current = false;
      const endY = e.changedTouches[0].clientY;
      const distance = endY - startY.current;
      if (distance >= threshold) {
        setRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
        }
      }
    },
    [onRefresh, threshold, refreshing],
  );

  return {
    refreshing,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}
