import React from "react";

export default function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        {title && <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>}
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
