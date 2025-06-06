import React from "react";

export const Button = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  const sizeClasses = size === "sm" ? "px-3 py-1 text-sm" : "px-4 py-2";
  let variantClasses = "";
  switch (variant) {
    case "secondary":
      variantClasses = "bg-secondary text-primary-dark hover:bg-secondary/80";
      break;
    case "outline":
      variantClasses = "border border-accent text-primary hover:bg-accent/10";
      break;
    default:
      variantClasses = "bg-primary text-white hover:bg-primary/90";
  }
  return (
    <button
      className={`${sizeClasses} rounded ${variantClasses} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}; 