import React from "react";
import { twMerge } from "tailwind-merge";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className,
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  ...props
}) => {
  const baseClasses =
    "relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500",
    secondary:
      "bg-secondary-100 hover:bg-secondary-200 text-secondary-800 focus:ring-secondary-500",
    accent:
      "bg-accent-500 hover:bg-accent-600 text-white focus:ring-accent-500",
    outline:
      "border border-primary-500 text-primary-500 hover:bg-primary-50 focus:ring-primary-500",
    ghost: "text-primary-500 hover:bg-primary-50 focus:ring-primary-500",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
  };

  const sizeClasses = {
    sm: "text-xs px-3 py-1.5 gap-1",
    md: "text-sm px-4 py-2 gap-1.5",
    lg: "text-base px-6 py-3 gap-2",
  };

  const loadingClasses = loading ? "cursor-wait opacity-80" : "";
  const widthClasses = fullWidth ? "w-full" : "";

  const mergedClasses = twMerge(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    loadingClasses,
    widthClasses,
    className
  );

  return (
    <button
      disabled={loading || props.disabled}
      className={mergedClasses}
      {...props}>
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}

      {icon && iconPosition === "left" && !loading && (
        <span className="mr-1.5">{icon}</span>
      )}

      {children}

      {icon && iconPosition === "right" && (
        <span className="ml-1.5">{icon}</span>
      )}
    </button>
  );
};

export default Button;
