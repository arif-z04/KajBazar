import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'md', // 'none' | 'sm' | 'md' | 'lg'
  onClick,
  ...rest
}) => {
  const hoverClass = hover ? 'kb-card-hover' : '';
  const paddingClass = `kb-card-pad-${padding}`;

  return (
    <div
      className={`kb-card ${paddingClass} ${hoverClass} ${className}`.trim()}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`kb-card-header ${className}`.trim()}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`kb-card-body ${className}`.trim()}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`kb-card-footer ${className}`.trim()}>{children}</div>
);

export default Card;
