"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LightboxProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  altText: string;
  onPrev?: () => void;
  onNext?: () => void;
  index?: number;
  total?: number;
}

const FOCUSABLE = 'button, [href], [tabindex]:not([tabindex="-1"])';

export default function Lightbox({
  isOpen,
  imageUrl,
  onClose,
  altText,
  onPrev,
  onNext,
  index,
  total,
}: LightboxProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  /**
   * Gates the "Loading image" live-region text. It starts false and flips true
   * on the following frame, so the region mounts empty and the text arrives as a
   * change — which is the only thing a live region announces.
   */
  const [announceLoading, setAnnounceLoading] = useState(false);

  // Reset the loading state whenever the displayed image changes.
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setAnnounceLoading(false);
    const frame = requestAnimationFrame(() => setAnnounceLoading(true));
    return () => cancelAnimationFrame(frame);
  }, [imageUrl]);

  // Keyboard: Escape closes, arrows step, Tab is trapped inside the dialog.
  useEffect(() => {
    if (!isOpen) return;

    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowLeft" && onPrev) {
        event.preventDefault();
        onPrev();
        return;
      }
      if (event.key === "ArrowRight" && onNext) {
        event.preventDefault();
        onNext();
        return;
      }
      if (event.key === "Tab" && overlayRef.current) {
        const focusable = Array.from(
          overlayRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
        ).filter((element) => element.offsetParent !== null);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && (active === first || !overlayRef.current.contains(active))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [isOpen, onClose, onPrev, onNext]);

  // Move focus into the dialog on open and restore it on close.
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const focusTimer = requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      cancelAnimationFrame(focusTimer);
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen]);

  // Lock background scroll while open without clobbering a previously set value.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    // A click on the padded dialod body must not close, only the bare backdrop.
    if (event.currentTarget === event.target) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          className="fixed inset-0 z-50 flex items-center justify-center focus:outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          <motion.div
            className="relative flex max-h-[90vh] w-full max-w-5xl items-center justify-center p-4"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-3 text-white/70 transition-colors duration-200 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
              aria-label="Close lightbox"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/*
              The "Loading" text is injected after mount, not rendered with the
              region. A live region announces changes to its content, so text
              that is already present when the region mounts is usually never
              announced at all.
            */}
            {!isLoaded && !hasError && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                role="status"
                aria-live="polite"
              >
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--border-subtle)] border-t-white/80" />
                {announceLoading && <span className="sr-only">Loading image</span>}
              </div>
            )}

            {hasError ? (
              <p className="bg-[var(--bg-secondary)] px-6 py-10 text-sm text-[var(--text-secondary)]">
                This image could not be loaded. Please try again later.
              </p>
            ) : (
              <motion.img
                key={imageUrl}
                src={imageUrl}
                alt={altText}
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
                className={`max-h-[90vh] max-w-full object-contain transition-opacity duration-300 ${
                  isLoaded ? "opacity-100" : "opacity-0"
                }`}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.div>

          <motion.div
            className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-4 text-xs uppercase tracking-widest text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {(onPrev || onNext) && (
              <>
                <button
                  type="button"
                  onClick={onPrev}
                  aria-label="Previous image"
                  className="flex items-center gap-2 p-3 transition-colors duration-200 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  aria-label="Next image"
                  className="flex items-center gap-2 p-3 transition-colors duration-200 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                >
                  <span className="hidden sm:inline">Next</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
                {typeof index === "number" && typeof total === "number" && (
                  <span className="tabular-nums text-white/70" aria-live="polite">
                    {index + 1} / {total}
                  </span>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
