import React from "react";
import Badge from "./ui/Badge";

const statusVariantMap = {
  Healthy: "healthy",
  "Low Stock": "low",
  Critical: "critical",
  Pending: "pending",
  Approved: "approved",
  Received: "received",
};

export default function StatusBadge({ status, className = "" }) {
  const variant = statusVariantMap[status] ?? "info";

  return (
    <Badge
      label={status ?? "Unknown"}
      variant={variant}
      className={className}
    />
  );
}
