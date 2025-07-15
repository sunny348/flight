import React from "react";
import { twMerge } from "tailwind-merge";

const Card = ({
  children,
  variant = "default",
  className,
  withHover = false,
  withBorder = false,
  ...props
}) => {
  const baseClasses = "bg-white dark:bg-secondary-900 rounded-xl shadow";

  const variantClasses = {
    default: "p-6",
    compact: "p-4",
    flush: "",
  };

  const hoverClasses = withHover
    ? "transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
    : "";
  const borderClasses = withBorder
    ? "border border-gray-200 dark:border-gray-700"
    : "";

  const mergedClasses = twMerge(
    baseClasses,
    variantClasses[variant],
    hoverClasses,
    borderClasses,
    className
  );

  return (
    <div
      className={mergedClasses}
      {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }) => {
  const classes = twMerge(
    "px-6 py-4 border-b border-gray-200 dark:border-gray-700 font-medium",
    className
  );

  return (
    <div
      className={classes}
      {...props}>
      {children}
    </div>
  );
};

export const CardBody = ({ children, className, ...props }) => {
  const classes = twMerge("p-6", className);

  return (
    <div
      className={classes}
      {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className, ...props }) => {
  const classes = twMerge(
    "px-6 py-4 border-t border-gray-200 dark:border-gray-700",
    className
  );

  return (
    <div
      className={classes}
      {...props}>
      {children}
    </div>
  );
};

export default Card;
