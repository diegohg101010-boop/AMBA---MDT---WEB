import './SkeletonLoader.css';

export const SkeletonCard = () => (
  <div className="skeleton-card-wrapper">
    <div className="skeleton skeleton-card"></div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="skeleton-table-wrapper">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="skeleton skeleton-table-row"></div>
    ))}
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="skeleton-text-wrapper">
    {[...Array(lines)].map((_, i) => (
      <div key={i} className="skeleton skeleton-text"></div>
    ))}
  </div>
);

export const SkeletonStats = () => (
  <div className="skeleton-stats-grid">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="skeleton-stat-card">
        <div className="skeleton skeleton-icon"></div>
        <div className="skeleton-stat-content">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text"></div>
        </div>
      </div>
    ))}
  </div>
);
