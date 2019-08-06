/* eslint-disable  */ // react/destructuring-assignment, react/no-array-index-key
import React from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import {
  Dropdown, Button, Icon, Menu,
} from 'antd';
import uuidv1 from 'uuid/v1';
import copy from 'copy-to-clipboard';

import Filter from './Filter/index';
import Operator from './Operator';
import Subquery from './Subquery';
import './style.scss';

const QUERY_ITEM_TYPE_FILTER = 'filter';
const QUERY_ITEM_TYPE_OPERATOR = 'operator';
const QUERY_ITEM_TYPE_SUBQUERY = 'subquery';

const QUERY_ACTION_COPY = 'copy'
const QUERY_ACTION_UNDO = 'undo'
const QUERY_ACTION_DELETE = 'delete'
const QUERY_ACTION_DUPLICATE = 'duplicate'



/*
    // Remove first item if it is an operator
    if (newData[0] && newData[0].type === QUERY_ITEM_TYPE_OPERATOR) {
      newData.splice(0, 1);
    }

 */

const sanitizeOperators = (data) => {
  while (data[0] && data[0].type === QUERY_ITEM_TYPE_OPERATOR) {
    data.splice(0, 1);
  }
  return data
}


class Query extends React.Component {
  constructor() {
    super();
    this.state = {
      data: null,
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
    this.sqon = this.sqon.bind(this)
    this.createMenuComponent = this.createMenuComponent.bind(this)
    this.handleMenuSelection = this.handleMenuSelection.bind(this)
  }

  componentWillMount() {
    const { data } = this.props;
    const newData = [...data];
    newData.map((newDatum) => {
      newDatum.key = uuidv1();
      return newDatum;
    });
    this.setState({
      data: newData,
    });
  }

  replaceItem(item, index = null) {
    const { data } = this.state;
    const { onEditCallback } = this.props;
    if (index === null) {
      index = item.index
    }
    const newData = [ ...data ]
    newData[index] = item
    this.setState({
      data: newData,
    }, () => {
      if (onEditCallback) {
        onEditCallback(this.serialize());
      }
    });
  }

  removeItem(item) {
    const { data } = this.state;
    const { onEditCallback, onRemoveCallback } = this.props;
    let newData = [ ...data ]
    const index = item.index;
    sanitizeOperators(newData)
    if (newData.length > 0) {
      this.setState({
        data: newData,
      }, () => {
        if (onEditCallback) {
          onEditCallback(this.serialize());
        }
      })
    } else {
      if (onRemoveCallback) {
        onRemoveCallback(item);
      }
    }
  }

  handleFilterRemoval(filter) {
    const { onEditCallback } = this.props;
    this.removeItem(filter);
  }

  handleOperatorRemoval(operator) {
    const { onEditCallback } = this.props;
    this.removeItem(operator);
  }

  handleSubqueryRemoval(subquery) {
    const { onEditCallback } = this.props;
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

  sqon() {
    const { data } = this.state;
    const sqon = data.map((datum) => {
      delete datum.key;
      return datum;
    })

    console.log(sqon)

    return {
      sqon,
    }
  }

  serialize() {
    const { data } = this.state;
    const { index } = this.props;
    return {
      data,
      index,
    }
  }

  handleMenuSelection({ key }) {
    switch(key) {
      case QUERY_ACTION_COPY:
        copy(JSON.stringify(this.state.data));
        if (this.props.onCopyCallback) {
          this.props.onCopyCallback(this.sqon());
        }
        break;
      case QUERY_ACTION_DELETE:
        if (this.props.onRemoveCallback) {
          this.props.onRemoveCallback(this.serialize());
        }
        break;
      case QUERY_ACTION_DUPLICATE:
        if (this.props.onDuplicateCallback) {
          this.props.onDuplicateCallback(this.serialize());
        }
        break;
      case QUERY_ACTION_UNDO:
        this.setState({
          data: [...this.props.data],
        })
        if (this.props.onUndoCallback) {
          this.props.onUndoCallback(this.serialize());
        }
        break;
      default:
        break;
    }
  }

  createMenuComponent() {
    const { options } = this.props
    const { copyable, duplicatable, removable, undoable } = options;
    return (<Menu onClick={this.handleMenuSelection}>
              {copyable && (
                <Menu.Item key={QUERY_ACTION_COPY}>
                  <Icon type="font-size" />
                  Copy to Clipboard
                </Menu.Item>)
              }
              {removable && (
                <Menu.Item key={QUERY_ACTION_DELETE}>
                  <Icon type="delete"/>
                  Delete Query
                </Menu.Item>)
              }
              {duplicatable && (
                <Menu.Item key={QUERY_ACTION_DUPLICATE}>
                  <Icon type="copy"/>
                  Duplicate Query
                </Menu.Item>)
              }
              {undoable && (
                <Menu.Item key={QUERY_ACTION_UNDO}>
                  <Icon type="undo" />
                  Undo Changes
                </Menu.Item>)
              }
        </Menu>)
  }

  render() {
    const { options, onSelectCallback } = this.props;
    const { copyable, duplicatable, removable, undoable } = options;
    const hasMenu = copyable || duplicatable || removable || undoable;
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
                        key={item.key}
                        index={index}
                        options={options}
                        data={item.data}
                        onEditCallback={this.handleOperatorChange}
                        onRemoveCallback={this.handleOperatorRemoval}

                    />
                );
              case QUERY_ITEM_TYPE_FILTER:
                return (
                    <Filter
                        key={item.key}
                        index={index}
                        options={options}
                        data={item.data}
                        onEditCallback={this.handleFilterChange}
                        onRemoveCallback={this.handleFilterRemoval}
                        onSelectCallback={onSelectCallback}
                    />
                );
              case QUERY_ITEM_TYPE_SUBQUERY:
                return (
                    <Subquery
                      key={item.key}
                      index={index}
                      options={options}
                      data={item.data}
                      onEditCallback={this.handleSubqueryChange}
                      onRemoveCallback={this.handleSubqueryRemoval}
                      onSelectCallback={onSelectCallback}
                    />
                );
              default:
                return null;
            }
          })}
        </div>
        { hasMenu && (
        <div className="actions">
          <Dropdown overlay={this.createMenuComponent}>
            <Icon type="more" />
          </Dropdown>
        </div>
        ) }
      </div>
    ) : null;
  }
}

Query.propTypes = {
  key: PropTypes.string,
  data: PropTypes.shape([]).isRequired,
  options: PropTypes.shape({}),
  onCopyCallback: PropTypes.func,
  onEditCallback: PropTypes.func,
  onDuplicateCallback: PropTypes.func,
  onRemoveCallback: PropTypes.func,
  onSelectCallback: PropTypes.func,
  onUndoCallback: PropTypes.func,
};

Query.defaultProps = {
  key: 'query',
  options: {
    copyable: true,
    duplicatable: true,
    editable: true,
    removable: true,
    selectable: false,
    undoable: true,
  },
  onCopyCallback: null,
  onEditCallback: null,
  onDuplicateCallback: null,
  onRemoveCallback: null,
  onSelectCallback: null,
  onUndoCallback: null,
};

export default Query;
