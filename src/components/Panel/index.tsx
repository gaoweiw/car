import type { ReactNode } from 'react';
import './style.scss';

interface PanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

const Panel = ({ title, children, className = '' }: PanelProps) => {
  return (
    <div className={`tech-panel ${className}`}>
      {title && (
        <div className="panel-title">
          <span className="title-text">{title}</span>
          <div className="title-decoration"></div>
        </div>
      )}
      <div className="panel-content">
        {children}
      </div>
      <div className="panel-corner corner-tl"></div>
      <div className="panel-corner corner-tr"></div>
      <div className="panel-corner corner-bl"></div>
      <div className="panel-corner corner-br"></div>
    </div>
  );
};

export default Panel;
