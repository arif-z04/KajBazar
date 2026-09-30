import React from 'react';
import { SearchX, Inbox, AlertCircle } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = SearchX,
  title = 'No results found',
  description = 'Try adjusting your search criteria or filters.',
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`kb-empty-state ${className}`.trim()}>
      <div className="kb-empty-icon-wrap">
        <Icon size={36} />
      </div>
      <h3 className="kb-empty-title">{title}</h3>
      <p className="kb-empty-description">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="kb-empty-action">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
