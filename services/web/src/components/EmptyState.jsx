import React from "react";
import Button from "./ui/Button";

export default function EmptyState({
  title = "No data available",
  description = "There is nothing to display right now.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="card px-6 py-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        ▢
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5 flex justify-center">
          <Button variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
