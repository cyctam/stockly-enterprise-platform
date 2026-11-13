import React from "react";

export function Table({ className = "", children }) {
  return (
    <div className={["w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card", className].join(" ")}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          {children}
        </table>
      </div>
    </div>
  );
}

export function TableHead({ className = "", children }) {
  return (
    <thead className={["bg-slate-50 border-b border-slate-200", className].join(" ")}>
      {children}
    </thead>
  );
}

export function TableBody({ className = "", children }) {
  return <tbody className={["divide-y divide-slate-100 bg-white", className].join(" ")}>{children}</tbody>;
}

export function TableRow({ className = "", children }) {
  return <tr className={["hover:bg-slate-50 transition-colors", className].join(" ")}>{children}</tr>;
}

export function TableHeaderCell({ className = "", children }) {
  return (
    <th
      scope="col"
      className={[
        "px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap",
        className,
      ].join(" ")}
    >
      {children}
    </th>
  );
}

export function TableCell({ className = "", children }) {
  return (
    <td className={["px-6 py-4 text-sm text-slate-700 whitespace-nowrap", className].join(" ")}>
      {children}
    </td>
  );
}

export function TableEmptyState({ title, description, action }) {
  return (
    <div className="px-6 py-10 text-center">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}