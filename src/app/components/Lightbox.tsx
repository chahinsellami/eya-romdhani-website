"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import type { PortfolioItem } from "../../data/portfolio";

interface LightboxProps {
  isOpen: boolean;
  items: PortfolioItem[];
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const FOCUSABLE = 'button, [href], [tabindex]:not([tabindex="-1"])';

export default function Lightbox({
  isOpen,
  items,
  activeIndex,
  onSelectIndex,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const currentItem = items[activeIndex] ?? null;
  const imageUrl = currentItem?.path ?? "";
  const altText =
    currentItem?.alt ||
    (currentItem ? `${currentItem.title} by ${currentItem.brand}` : "");

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [imageUrl]);

  useEffect(() => {
    if (!isOpen) return;

    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPrev();
        return;
      }
      if (event.key === "ArrowRight") {
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

        if (
          event.shiftKey &&
          (active === first || !overlayRef.current.contains(active))
        ) {
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

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const focusTimer = requestAnimationFrame(() =>
      closeButtonRef.current?.focus(),
    );

    return () => {
      cancelAnimationFrame(focusTimer);
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.currentTarget === event.target) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && currentItem && (
        <motion.div
          ref={overlayRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={`Viewing ${currentItem.title}`}
         
          className="fixed inset-0 z-50 flex flex-col justify-between bg-[var(--ink)] text-[var(--bone)] backdrop-blur-md focus:outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
            <div className="flex min-w-0 items-baseline gap-4">
              <span className="text-[0.9375rem] tabular-nums text-white/60">
                {activeIndex + 1} of {items.length}
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-[0.9375rem] font-semibold">
                  {currentItem.title}
                </h3>
                <p className="truncate text-[0.8125rem] text-white/60">
                  {[currentItem.category, currentItem.collection].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center gap-2 px-2 text-[0.9375rem] font-semibold text-white/80 transition-colors duration-200 hover:text-white"
              aria-label="Close lightbox"
            >
              <span className="hidden sm:inline">Close</span>
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Center photographic stage */}
          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-4 sm:px-14"
            onClick={handleBackdropClick}
          >
            {items.length > 1 && (
              <button
                type="button"
                onClick={onPrev}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/15 bg-[var(--ink)]/70 text-white/80 transition-colors duration-200 hover:border-white hover:text-white sm:left-6"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            )}

            <div className="relative flex max-h-[68vh] w-full max-w-4xl items-center justify-center">
              {!isLoaded && !hasError && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  role="status"
                  aria-live="polite"
                >
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <span className="sr-only">Loading image</span>
                </div>
              )}

              {hasError ? (
                <p className="border border-white/15 bg-white/5 px-6 py-10 text-sm text-white/75">
                  This image could not be loaded. Please try again later.
                </p>
              ) : (
                <motion.img
                  key={imageUrl}
                  src={imageUrl}
                  alt={altText}
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onLoad={() => setIsLoaded(true)}
                  onError={() => setHasError(true)}
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: isLoaded ? 1 : 0, scale: 1 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="max-h-[68vh] max-w-full object-contain"
                />
              )}
            </div>

            {items.length > 1 && (
              <button
                type="button"
                onClick={onNext}
                aria-label="Next image"
                className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-white/15 bg-[var(--ink)]/70 text-white/80 transition-colors duration-200 hover:border-white hover:text-white sm:right-6"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Bottom contact-sheet thumbnail strip */}
          {items.length > 1 && (
            <div className="border-t border-white/10 px-6 py-3">
              <div className="scroll-slim mx-auto flex max-w-3xl items-center justify-start gap-2.5 overflow-x-auto sm:justify-center">
                {items.map((item, idx) => {
                  const isCurrent = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectIndex(idx)}
                      aria-label={`View ${item.title}`}
                      aria-current={isCurrent ? "true" : undefined}
                      className={`relative h-14 w-11 shrink-0 overflow-hidden border transition-all duration-200 ${
                        isCurrent
                          ? "border-[var(--accent)] opacity-100"
                          : "border-white/15 opacity-50 hover:opacity-85"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.path}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                        style={{ objectPosition: item.position ?? "50% 30%" }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
