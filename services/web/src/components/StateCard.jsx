import React from "react";
import Button from "./ui/Button";

export default function StateCard({
  variant = "loading",
  title,
  description,
  actionLabel,
  onAction,
}) {
  const resolvedTitle =
    title ??
    (variant === "error" ? "Unable to load data" : "Loading dashboard data");

  const resolvedDescription =
    description ??
    (variant === "error"
      ? "We ran into an issue reaching the service. Try again or contact support if the problem persists."
      : "Fetching the latest operational signals from connected services.");

  const icon =
    variant === "error" ? (
      <span className="text-rose-500">!</span>
    ) : (
      <span className="animate-pulse text-slate-400">●</span>
    );

  return (
    <div className="card px-6 py-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{resolvedTitle}</h3>
      <p className="mt-2 text-sm text-slate-500">{resolvedDescription}</p>
      {actionLabel && onAction && (
        <div className="mt-5 flex justify-center">
          <Button variant={variant === "error" ? "primary" : "secondary"} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
