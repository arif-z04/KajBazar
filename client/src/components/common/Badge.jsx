import React from 'react';
import { ShieldCheck, Clock, XCircle, AlertTriangle, CheckCircle, Tag } from 'lucide-react';

export const Badge = ({
  children,
  variant = 'neutral', // 'verified' | 'pending' | 'rejected' | 'role' | 'success' | 'warning' | 'info' | 'neutral'
  size = 'md', // 'sm' | 'md'
  icon = true,
  className = '',
  ...rest
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    const iconSize = size === 'sm' ? 12 : 14;

    switch (variant) {
      case 'verified':
        return <ShieldCheck size={iconSize} className="kb-badge-icon" />;
      case 'pending':
        return <Clock size={iconSize} className="kb-badge-icon" />;
      case 'rejected':
        return <XCircle size={iconSize} className="kb-badge-icon" />;
      case 'warning':
        return <AlertTriangle size={iconSize} className="kb-badge-icon" />;
      case 'success':
        return <CheckCircle size={iconSize} className="kb-badge-icon" />;
      default:
        return null;
    }
  };

  return (
    <span className={`kb-badge kb-badge-${variant} kb-badge-${size} ${className}`.trim()} {...rest}>
      {renderIcon()}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
