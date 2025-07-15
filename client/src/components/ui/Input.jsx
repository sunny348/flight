import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const Input = forwardRef(({ 
  className, 
  type = 'text',
  error,
  label,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  ...props 
}, ref) => {
  const baseClasses = "block rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-colors duration-200";
  const errorClasses = error ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500" : "";
  const iconClasses = icon ? (iconPosition === 'left' ? "pl-10" : "pr-10") : "";
  const widthClasses = fullWidth ? "w-full" : "";
  
  const mergedClasses = twMerge(
    baseClasses,
    errorClasses,
    iconClasses,
    widthClasses,
    className
  );

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={props.id} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={mergedClasses}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 