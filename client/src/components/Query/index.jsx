/* eslint-disable  */ // react/destructuring-assignment, react/no-array-index-key
import React from 'react';
import PropTypes from 'prop-types';
import { differenceWith, isEqual } from 'lodash';
import uuidv1 from 'uuid/v1';

import Filter from './Filter';
import Operator from './Operator';
// import Subquery from './Subquery';


// filter out loose first, loose last and double following operators

const QUERY_ITEM_TYPE_FILTER = 'filter';
const QUERY_ITEM_TYPE_OPERATOR = 'operator';
const QUERY_ITEM_TYPE_SUBQUERY = 'subquery';


class Query extends React.Component {
  constructor() {
    super();
    this.state = {
      data: null,
    };
    this.replaceItem = this.replaceItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.handleFilterRemoval = this.handleFilterRemoval.bind(this);
    this.handleOperatorRemoval = this.handleOperatorRemoval.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleOperatorChange = this.handleOperatorChange.bind(this);
  }

  componentWillMount() {
    const { data } = this.props;
    this.setState({
      data: JSON.parse(JSON.stringify(data)),
    });
  }

  replaceItem(item, index = null) {
    const { data } = this.state;
    if (index === null) {
      index = item.index
    }
    data[index] = item
    this.setState({
      data,
    });
  }

  removeItem(item) {
    const { data } = this.state;
    data.splice(item.index, 1);
    // Remove first item if it is an operator
    if (data[0] && data[0].type === QUERY_ITEM_TYPE_OPERATOR) {
      data.splice(0, 1);
    }

    this.setState({
      data,
    });
  }

  handleFilterRemoval(filter) {
    this.removeItem(filter);
  }

  handleOperatorRemoval(operator) {
    this.removeItem(operator);
  }

  handleFilterChange(filter) {
    this.replaceItem({
      type: QUERY_ITEM_TYPE_FILTER,
      data: filter.data,
      options: filter.options,
    });
  }

  handleOperatorChange(operator) {
    this.replaceItem({
      type: QUERY_ITEM_TYPE_OPERATOR,
      data: operator.data,
      options: operator.options,
    });
  }

  render() {
    const initial = this.props.data;
    const current = this.state.data;

    console.log(initial)
    console.log(current)

    const isDirty = !isEqual(initial, current);

    return (
      <div
        className="query"
        style={{
          border: `1px ${isDirty ? 'dashed #085798' : 'solid #CCCCCC'}`, display: 'inline-flex', padding: '5px 8px 4px 8px', marginBottom: 5,
        }}
      >
        { current.map((item, index) => {
          switch (item.type) {
            case QUERY_ITEM_TYPE_OPERATOR:
              return (
                  <Operator
                      key={`operator-${uuidv1()}`}
                      index={index}
                      options={item.options}
                      data={item.data}
                      onChangeCallback={this.handleOperatorChange}
                      onRemovalCallback={this.handleOperatorRemoval}
                  />
              );
            case QUERY_ITEM_TYPE_FILTER:
              return (
                  <Filter
                      key={`filter-${uuidv1()}`}
                      index={index}
                      options={item.options}
                      data={item.data}
                      onChangeCallback={this.handleFilterChange}
                      onRemovalCallback={this.handleFilterRemoval}
                  />
              );
            case QUERY_ITEM_TYPE_SUBQUERY:
            default:
              return null;
          }
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
