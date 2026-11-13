import React, { useEffect } from "react";

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass =
    size === "lg"
      ? "max-w-3xl"
      : size === "sm"
        ? "max-w-md"
        : "max-w-2xl";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />
      <div
        className={[
          "relative w-full rounded-xl border border-slate-200 bg-white shadow-card",
          sizeClass,
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
