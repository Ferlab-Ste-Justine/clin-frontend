import React from 'react';
import './style.scss';

interface Props {
  color?: string;
  size?: number;
}

const Badge: React.FC<Props> = ({ color = '#000', size = 8 }) => (
  <span
    className="clin-badge"
    style={{
      '--color': color,
      '--size': `${size}px`,
    } as React.CSSProperties}
  >&nbsp;
  </span>
);

export default Badge;
