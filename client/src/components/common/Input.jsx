import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = ({
  label,
  id,
  type = 'text',
  error,
  helperText,
  required = false,
  icon: Icon,
  className = '',
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`kb-form-field ${error ? 'has-error' : ''} ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="kb-label">
          {label} {required && <span className="kb-required-star">*</span>}
        </label>
      )}
      <div className="kb-input-wrap">
        {Icon && <Icon size={18} className="kb-input-icon-left" />}
        <input
          id={inputId}
          type={effectiveType}
          required={required}
          className={`kb-input ${Icon ? 'has-icon-left' : ''} ${isPassword ? 'has-icon-right' : ''}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="kb-password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span className="kb-field-error" role="alert">{error}</span>}
      {helperText && !error && <span className="kb-field-helper">{helperText}</span>}
    </div>
  );
};

export const Select = ({
  label,
  id,
  error,
  helperText,
  required = false,
  children,
  className = '',
  ...rest
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`kb-form-field ${error ? 'has-error' : ''} ${className}`.trim()}>
      {label && (
        <label htmlFor={selectId} className="kb-label">
          {label} {required && <span className="kb-required-star">*</span>}
        </label>
      )}
      <div className="kb-select-wrap">
        <select id={selectId} required={required} className="kb-select" {...rest}>
          {children}
        </select>
      </div>
      {error && <span className="kb-field-error" role="alert">{error}</span>}
      {helperText && !error && <span className="kb-field-helper">{helperText}</span>}
    </div>
  );
};

export const Textarea = ({
  label,
  id,
  error,
  helperText,
  required = false,
  rows = 4,
  className = '',
  ...rest
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`kb-form-field ${error ? 'has-error' : ''} ${className}`.trim()}>
      {label && (
        <label htmlFor={textareaId} className="kb-label">
          {label} {required && <span className="kb-required-star">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        required={required}
        rows={rows}
        className="kb-textarea"
        {...rest}
      />
      {error && <span className="kb-field-error" role="alert">{error}</span>}
      {helperText && !error && <span className="kb-field-helper">{helperText}</span>}
    </div>
  );
};

export default Input;
