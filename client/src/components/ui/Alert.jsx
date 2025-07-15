import React from "react";

const Alert = ({ type = "info", children, className = "" }) => {
  let alertClasses = "p-4 rounded-md ";

  switch (type) {
    case "success":
      alertClasses +=
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      break;
    case "warning":
      alertClasses +=
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      break;
    case "error":
      alertClasses +=
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      break;
    case "info":
    default:
      alertClasses +=
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      break;
  }

  return (
    <div
      className={`${alertClasses} ${className}`}
      role="alert">
      {children}
    </div>
  );
};

export default Alert;
