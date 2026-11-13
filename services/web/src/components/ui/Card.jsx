import React from "react";

export function Card({ className = "", children }) {
  return (
    <div className={["card", className].join(" ")}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, actions, className = "" }) {
  return (
    <div className={["card-header", className].join(" ")}>
      <div className="flex items-start justify-between gap-4">
        <div>
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return <div className={["card-body", className].join(" ")}>{children}</div>;
}

export function CardFooter({ className = "", children }) {
  return (
    <div className={["px-6 py-4 border-t border-slate-200", className].join(" ")}>
      {children}
    </div>
  );
}
