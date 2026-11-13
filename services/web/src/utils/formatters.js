const safeNumber = (value, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(date);
};

export const formatNumber = (value) => {
  const safeValue = safeNumber(value, null);
  if (safeValue === null) return "—";
  return new Intl.NumberFormat("en-GB").format(safeValue);
};

export const formatQuantity = (value, unit) => {
  const safeValue = safeNumber(value, null);
  if (safeValue === null) return "—";

  const formatted = new Intl.NumberFormat("en-GB").format(safeValue);
  return unit ? `${formatted} ${unit}` : formatted;
};

export const formatStockStatus = (currentStock, minStock) => {
  const current = safeNumber(currentStock, 0);
  const minimum = safeNumber(minStock, 0);

  if (current <= 0 || current < minimum * 0.5) return "Critical";
  if (current < minimum) return "Low Stock";
  return "Healthy";
};

export const formatRequestStatus = (status) => {
  if (!status) return "Pending";
  const normalized = String(status).toLowerCase();
  if (normalized.includes("approved")) return "Approved";
  if (normalized.includes("received")) return "Received";
  return "Pending";
};

export const formatMovementType = (type) => {
  const normalized = String(type || "").toLowerCase();
  return normalized === "outflow" ? "Outflow" : "Inflow";
};
