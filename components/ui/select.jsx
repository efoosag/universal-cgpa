"use client";

import React from "react";

/**
 * Root Select component
 */

export function Select({ value, onValueChange, className = "", children }) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={`
        w-full rounded-md border border-slate-300
        bg-white px-3 py-2 text-slate-900
        focus:outline-none focus:ring-2 focus:ring-blue-500
        focus:border-blue-500
        transition
        ${className}
      `}
    >
      {children}
    </select>
  );
}

export default Select;

/**
 * Trigger = actual <select>
 */
export function SelectTrigger({
  value,
  onValueChange,
  className = "",
  children,
}) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={`w-full border rounded p-2 
        focus:outline-none focus:ring 
        focus:ring-primary/40 
        bg-background ${className}`}
    >
      {children}
    </select>
  );
}

/**
 * Placeholder handler
 */
export function SelectValue({ placeholder }) {
  return (
    <option value="" disabled hidden>
      {placeholder}
    </option>
  );
}

/**
 * Content wrapper (no-op, for API compatibility)
 */
export function SelectContent({ children }) {
  return <>{children}</>;
}

/**
 * Item = <option>
 */
export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}
