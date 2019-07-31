/* eslint-disable react/destructuring-assignment, react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';

import Filter from './Filter';
import Operator from './Operator';


// filter out loose first, loose last and double following operators

class Query extends React.Component {
  constructor() {
    super();
    this.state = {
      data: null,
    };
    this.removeItem = this.removeItem.bind(this);
    this.handleFilterRemoval = this.handleFilterRemoval.bind(this);
    this.handleOperatorRemoval = this.handleOperatorRemoval.bind(this);
  }

  componentWillMount() {
    const { data } = this.props;
    this.setState({
      data,
    });
  }

  removeItem(item) {
    const { data } = this.state;
    const newData = data.slice();
    newData.splice(item.index, 1);
    this.setState({
      data: newData,
    });
  }

  handleFilterRemoval(filter) {
    this.removeItem(filter);
    // @TODO Remove dangling operators
  }

  handleOperatorRemoval(operator) {
    this.removeItem(operator);
    // @TODO Remove dangling filters
  }

  render() {
    const initial = this.props.data;
    const current = this.state.data;
    const isDirty = !isEqual(current, initial);

    return (
      <div
        className="query"
        style={{
          border: `1px ${isDirty ? 'dashed #085798' : 'solid #CCCCCC'}`, display: 'inline-flex', padding: '5px 8px 4px 8px', marginBottom: 5,
        }}
      >
        { current.map((item, index) => {
          if (item.type === 'operator') {
            return (
              <Operator
                key={`operator-${index}`}
                index={index}
                options={item.options}
                data={item.data}
                removalCallback={this.handleFilterRemoval}
              />
            );
          } if (item.type === 'filter') {
            return (
              <Filter
                key={`filter-${index}`}
                index={index}
                options={item.options}
                data={item.data}
                removalCallback={this.handleOperatorRemoval}
              />
            );
          }
          return null;
        })}
      </div>
    );
  }
}

Query.propTypes = {
  data: PropTypes.shape([]).isRequired,
  options: PropTypes.shape({}),
};

Query.defaultProps = {
  options: {},
};

export default Query;
