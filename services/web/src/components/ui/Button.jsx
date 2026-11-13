import React from "react";

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

const variants = {
  primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-soft",
  secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
  danger: "bg-rose-600 text-white hover:bg-rose-500",
};

export default function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) {
  const variantStyles = variants[variant] ?? variants.primary;

  return (
    <button
      type={type}
      className={[baseStyles, variantStyles, className].join(" ")}
      {...props}
    />
  );
}
