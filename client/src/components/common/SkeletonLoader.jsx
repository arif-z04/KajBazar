import React from 'react';

export const Skeleton = ({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`kb-skeleton ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
};

export const WorkerCardSkeleton = () => (
  <div className="kb-card kb-card-pad-md kb-skeleton-card">
    <div className="kb-skeleton-row">
      <Skeleton width="48px" height="48px" borderRadius="50%" />
      <div style={{ flex: 1 }}>
        <Skeleton width="60%" height="18px" />
        <Skeleton width="40%" height="14px" style={{ marginTop: '6px' }} />
      </div>
      <Skeleton width="64px" height="24px" borderRadius="9999px" />
    </div>
    <div className="kb-skeleton-tags" style={{ display: 'flex', gap: '6px', margin: '14px 0 10px' }}>
      <Skeleton width="70px" height="22px" borderRadius="9999px" />
      <Skeleton width="85px" height="22px" borderRadius="9999px" />
    </div>
    <Skeleton width="90%" height="14px" />
    <Skeleton width="75%" height="14px" style={{ marginTop: '4px' }} />
    <div className="kb-skeleton-meta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '16px' }}>
      <Skeleton height="36px" borderRadius="var(--radius-sm)" />
      <Skeleton height="36px" borderRadius="var(--radius-sm)" />
      <Skeleton height="36px" borderRadius="var(--radius-sm)" />
    </div>
    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
      <Skeleton height="38px" style={{ flex: 1 }} borderRadius="var(--radius-sm)" />
      <Skeleton height="38px" style={{ flex: 1 }} borderRadius="var(--radius-sm)" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr className="kb-skeleton-row-tr">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i}>
        <Skeleton height="16px" width={i === 0 ? '70%' : i === columns - 1 ? '50%' : '80%'} />
      </td>
    ))}
  </tr>
);

export default Skeleton;
