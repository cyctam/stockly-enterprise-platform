import React from "react";
import Input from "./ui/Input";
import Select from "./ui/Select";

export default function SearchFilterBar({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  categoryValue,
  onCategoryChange,
  statusOptions = [],
  categoryOptions = [],
}) {
  return (
    <div className="card p-4 md:p-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Input
          label="Search materials"
          placeholder="Search by name or category"
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
        />
        <Select
          label="Filter by status"
          value={statusValue}
          onChange={(event) => onStatusChange?.(event.target.value)}
        >
          <option value="">All statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
        <Select
          label="Filter by category"
          value={categoryValue}
          onChange={(event) => onCategoryChange?.(event.target.value)}
        >
          <option value="">All categories</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
