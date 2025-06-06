import React from "react";

export const Badge = ({ variant = "solid", className = "", ...props }) => {
  const base = "text-xs font-medium px-2.5 py-0.5 rounded";
  const variantClasses =
    variant === "outline"
      ? "border border-accent text-primary-dark bg-secondary"
      : "bg-primary text-white";
  return <span className={`${base} ${variantClasses} ${className}`} {...props} />;
}; 