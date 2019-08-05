/* eslint-disable  */ // react/destructuring-assignment, react/no-array-index-key
import React from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import uuidv1 from 'uuid/v1';
import {
  Dropdown, Button, Icon, Menu,
} from 'antd';

import Filter from './Filter';
import Operator from './Operator';
import Subquery from './Subquery';
import './style.scss';

const QUERY_ITEM_TYPE_FILTER = 'filter';
const QUERY_ITEM_TYPE_OPERATOR = 'operator';
const QUERY_ITEM_TYPE_SUBQUERY = 'subquery';

const QUERY_ACTION_UNDO = 'undo'
const QUERY_ACTION_DELETE = 'delete'

class Query extends React.Component {
  constructor() {
    super();
    this.state = {
      data: null,
      options: null,
    };
    this.replaceItem = this.replaceItem.bind(this)
    this.removeItem = this.removeItem.bind(this)
    this.handleFilterRemoval = this.handleFilterRemoval.bind(this)
    this.handleOperatorRemoval = this.handleOperatorRemoval.bind(this)
    this.handleSubqueryRemoval = this.handleSubqueryRemoval.bind(this)
    this.handleFilterChange = this.handleFilterChange.bind(this)
    this.handleOperatorChange = this.handleOperatorChange.bind(this)
    this.handleSubqueryChange = this.handleSubqueryChange.bind(this)
    this.serialize = this.serialize.bind(this)
    this.createMenuComponent = this.createMenuComponent.bind(this)
    this.handleMenuSelection = this.handleMenuSelection.bind(this)
  }

  componentWillMount() {
    const { data, options } = this.props;
    this.setState({
      data: [...data],
      options: {...options}
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

  handleSubqueryRemoval(subquery) {
    this.removeItem(subquery);
  }

  handleFilterChange(filter) {
    this.replaceItem({
      type: QUERY_ITEM_TYPE_FILTER,
      index: filter.index,
      data: filter.data,
      options: filter.options,
    });
  }

  handleOperatorChange(operator) {
    this.replaceItem({
      type: QUERY_ITEM_TYPE_OPERATOR,
      index: operator.index,
      data: operator.data,
      options: operator.options,
    });
  }

  handleSubqueryChange(subquery) {
    this.replaceItem({
      type: QUERY_ITEM_TYPE_SUBQUERY,
      index: subquery.index,
      data: subquery.data,
      options: subquery.options,
    });
  }

  serialize() {
    return Object.assign({}, this.props, this.state);
  }

  handleMenuSelection({ key }) {
    switch(key) {
      case QUERY_ACTION_UNDO:
        this.setState({
          data: [...this.props.data],
        })
        break;
      case QUERY_ACTION_DELETE:
        break;
      default:
        break;
    }
  }

  createMenuComponent() {
    return(
        <Menu onClick={this.handleMenuSelection}>
          <Menu.Item key={QUERY_ACTION_UNDO}>
            <Icon type="undo" />
            Undo Changes
          </Menu.Item>
          <Menu.Item key={QUERY_ACTION_DELETE}>
            <Icon type="delete" />
            Delete Query
          </Menu.Item>
        </Menu>
    );

  }

  render() {
    const initial = this.props.data;
    const current = this.state.data;
    const isDirty = !isEqual(initial, current);

    return current.length > 0 ? (
      <div className="query">
      <div
        className="items"
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
              return (
                  <Subquery
                    key={`subquery-${uuidv1()}`}
                    index={index}
                    options={item.options}
                    data={item.data}
                    onChangeCallback={this.handleSubqueryChange}
                    onRemovalCallback={this.handleSubqueryRemoval}
                  />
              );
            default:
              return null;
          }
        })}
      </div>
      <div className="actions">
        <Dropdown overlay={this.createMenuComponent}>
          <Button icon="more" size="small" />
        </Dropdown>
      </div>
      </div>
    ) : null;
  }
}

Query.propTypes = {
  data: PropTypes.shape([]).isRequired,
  options: PropTypes.shape({}),
};

Query.defaultProps = {
  options: {
    undoable: true,
    deletable: true,
  },
};

export default Query;
