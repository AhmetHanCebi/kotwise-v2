'use client';

import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: ('half' | 'full')[];
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints: _snapPoints,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  const isDragging = useRef(false);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    touchCurrentY.current = e.touches[0].clientY;
    const diff = touchCurrentY.current - touchStartY.current;
    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = touchCurrentY.current - touchStartY.current;
    if (sheetRef.current) {
      if (diff > 100) {
        onClose();
      }
      sheetRef.current.style.transform = '';
    }
    touchStartY.current = 0;
    touchCurrentY.current = 0;
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto rounded-t-3xl animate-slide-up"
        style={{
          background: 'var(--color-bg-card)',
          maxHeight: '85vh',
          boxShadow: 'var(--shadow-lg)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Bottom sheet'}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: 'var(--color-border)' }}
          />
        </div>

        {/* Title */}
        {title && (
          <div className="px-5 pb-3 flex items-center justify-between">
            <h3
              className="text-lg font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="Kapat"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div
          className="overflow-y-auto px-5 pb-8"
          style={{ maxHeight: 'calc(85vh - 60px)' }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
