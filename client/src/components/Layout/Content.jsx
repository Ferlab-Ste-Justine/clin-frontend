import React from 'react';

const Content = (props) => {
  const { children } = props; // eslint-disable-line react/prop-types
  return (
    <div id="content">
      { children }
    </div>
  );
};

export default Content;
