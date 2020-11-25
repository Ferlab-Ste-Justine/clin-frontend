import React from 'react';

import PropTypes from 'prop-types';
import style from '../../styles/term.module.scss';

const hasComparator = (t) => !!t.comparator;
const isNotMarkedForDeletion = (t) => !t.markedForDeletion;

const Interval = ({ terms }) => {
  const termList = terms.filter(hasComparator).filter(isNotMarkedForDeletion);

  if (termList.length === 2) {
    return (
      <div className={style.termList}>
        { `[${termList[0].value}, ${termList[1].value}]` }
      </div>
    );
  }

  return (
    <div className={style.termList}>
      { `${termList[0].value}` }
    </div>
  );
};

Interval.propTypes = {
  terms: PropTypes.array.isRequired,
};

export default Interval;
