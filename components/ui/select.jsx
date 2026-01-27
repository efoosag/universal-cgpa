"use client";

import React from "react";

// Simple Select wrapper
export function Select({ value, onValueChange, className = "", children, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={`border rounded p-2 focus:outline-none focus:ring focus:ring-blue-300 ${className}`}
    >
      {placeholder && (
        <option value="" disabled hidden>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  );
}

// Item component for consistency
export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}

// Named exports
Select.Item = SelectItem;

export default Select;
