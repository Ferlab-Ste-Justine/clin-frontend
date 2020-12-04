import React from 'react';

interface Props {
  className?: string
  children: React.ReactNode
}

function HeaderCustomCell({ className = '', children }: Props) {
  return (
    <div className={['table__header__custom', className].join(' ')}>
      { children }
    </div>
  );
}

HeaderCustomCell.defaultProps = {
  className: '',
};

export default HeaderCustomCell;
