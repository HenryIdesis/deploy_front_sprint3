import React from "react";

export const Card = ({ className = "", ...props }) => (
  <div
    className={`rounded-lg bg-white shadow border ${className}`.trim()}
    {...props}
  />
);

export const CardHeader = ({ className = "", ...props }) => (
  <div className={`px-6 py-4 ${className}`.trim()} {...props} />
);

export const CardTitle = ({ className = "", ...props }) => (
  <h3 className={`text-lg font-semibold ${className}`.trim()} {...props} />
);

export const CardContent = ({ className = "", ...props }) => (
  <div className={`px-6 py-4 ${className}`.trim()} {...props} />
); 