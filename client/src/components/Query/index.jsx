/* eslint-disable  */ // react/destructuring-assignment, react/no-array-index-key
import React from 'react';
import PropTypes from 'prop-types';
import { isEqual, pullAllBy } from 'lodash';
import {
  Dropdown, Button, Icon, Menu, Input, Tooltip, Divider,
} from 'antd';
import { cloneDeep } from 'lodash';
import copy from 'copy-to-clipboard';

import Filter from './Filter/index';
import Operator, { DEFAULT_EMPTY_OPERATOR } from './Operator';
import Subquery from './Subquery';
import './style.scss';

const QUERY_ITEM_TYPE_FILTER = 'filter';
export const QUERY_ITEM_TYPE_OPERATOR = 'operator';
const QUERY_ITEM_TYPE_SUBQUERY = 'subquery';

const QUERY_ACTION_COPY = 'copy'
const QUERY_ACTION_UNDO_ALL = 'undo-all'
const QUERY_ACTION_DELETE = 'delete'
const QUERY_ACTION_DUPLICATE = 'duplicate'
const QUERY_ACTION_COMPOUND_OPERATORS = 'compound-operators'
const QUERY_ACTION_VIEW_SQON = 'view-sqon'
const QUERY_ACTION_TITLE = 'title'

const sanitizeOperators = (data) => {
  // There musn't be any subsequent operators
  let lastOperatorIndex = null;
  const sanitizedData = data.filter((datum, index) => {
    if (datum.type === QUERY_ITEM_TYPE_OPERATOR) {
      if ( lastOperatorIndex !== null && lastOperatorIndex === (index - 1) ) {
        lastOperatorIndex = index;
        return false;
      }
      lastOperatorIndex = index;
    }
    return true;
  });

  // No dangling operator as a query prefix
  if (sanitizedData[0] && sanitizedData[0].type === QUERY_ITEM_TYPE_OPERATOR) {
    sanitizedData.splice(0, 1);
  }

  // There must be at least one operator in the query
  const operators = pullAllBy(sanitizedData, [{ 'type': QUERY_ITEM_TYPE_OPERATOR }], 'type')
  const operatorsCount = operators.length;
  if (operatorsCount < 1) {
    console.log(' there was not at least one operator')
    data.push(DEFAULT_EMPTY_OPERATOR)
  }

  return sanitizedData
}


class Query extends React.Component {
  constructor() {
    super();
    this.state = {
      data: null,
      display: null,
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
    this.handleTitleChange = this.handleTitleChange.bind(this)
    this.handleAdvancedChange = this.handleAdvancedChange.bind(this)
  }

  componentWillMount() {
    const { display, draft } = this.props;
    //draft.instructions.map((datum) => {
    //  datum.key = uuidv1();
    //  return datum;
    //});
    const clone = cloneDeep(draft);
    this.setState({
      data: clone,
      display,
    });
  }



  replaceItem(item, index = null) {
    const { data } = this.state;
    const { onEditCallback } = this.props;
    if (index === null) {
      index = item.index
    }
    data.instructions[index] = item
    this.setState({
      data,
    }, () => {
      if (onEditCallback) {
        onEditCallback(this.serialize());
      }
    });
  }

  removeItem(instruction) {
    const { data } = this.state;
    const { onEditCallback, onRemoveCallback } = this.props;
    const index = instruction.index;
    data.instructions.splice(index, 1);
    sanitizeOperators(data.instructions);

    console.log(' ___ AFTER SANITIZE ___');
    console.log(data.instructions)

    if (data.instructions.length > 0) {
      this.setState({
        data,
      }, () => {
        if (onEditCallback) {
          onEditCallback(this.serialize());
        }
      })
    } else {
      if (onRemoveCallback) {
        onRemoveCallback(this.serialize());
      }
    }
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

  // @NOTE All operators within a query must have the same type
  handleOperatorChange(operator) {
    const { data } = this.state;
    const { onEditCallback } = this.props;
    data.instructions.map((datum, index) => {
      if (datum.type === QUERY_ITEM_TYPE_OPERATOR) {
        datum.data.type = operator.data.type
      }
      return datum;
    });
    this.setState({
      data
    }, () => {
      if (onEditCallback) {
        onEditCallback(this.serialize());
      }
    })
  }

  handleSubqueryChange(subquery) {
    this.replaceItem({
      type: QUERY_ITEM_TYPE_SUBQUERY,
      index: subquery.index,
      data: subquery.data,
      options: subquery.options,
    });
  }

  handleTitleChange(e) {
    const title = e.target.value;
    const { data } = this.state;
    data.title = title;
    this.setState({
      data,
    }, () => {
      if (this.props.onEditCallback) {
        this.props.onEditCallback(this.serialize());
      }
    })
  }

  handleAdvancedChange(e) {



    console.log(e)



    //this.setState({
    //  data: editor.updated_src,
    //})


  }

  sqon() {
    const { data } = this.state;
    const sqon = data.instructions.map((datum) => {
      delete datum.key;
      return datum;
    })
    return sqon;
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
    const { display } = this.state;
    const { data } = this.state;
    switch(key) {
      case QUERY_ACTION_COPY:
        const sqon = JSON.stringify(this.sqon());
        copy(sqon);
        if (this.props.onCopyCallback) {
          this.props.onCopyCallback(sqon);
        }
        break;
      case QUERY_ACTION_VIEW_SQON:
        display.viewableSqon = !display.viewableSqon
        this.setState({
          display,
        })
        break;
      case QUERY_ACTION_COMPOUND_OPERATORS:
        display.compoundOperators = !display.compoundOperators
        this.setState({
          display,
        })
        break;
      case QUERY_ACTION_TITLE:;
        if (!data.title) {
          data.title = 'Untitled';
        } else {
          delete data.title
        }
        this.setState({
          data,
        }, () => {
          if (this.props.onEditCallback) {
            this.props.onEditCallback(this.serialize());
          }
        })
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
      case QUERY_ACTION_UNDO_ALL:
        const { original } = this.props;
        const clone = cloneDeep(original);
        this.setState({
          data: clone,
        }, () => {
          if (this.props.onEditCallback) {
            this.props.onEditCallback(this.serialize());
          }
        })
        break;
      default:
        break;
    }
  }

  createMenuComponent() {
    const { options, original } = this.props
    const { display, data } = this.state
    const { copyable, duplicatable, editable, removable, undoable } = options;
    const { compoundOperators, viewableSqon } = display;
    const hasTitle = !!data.title;

    return (<Menu onClick={this.handleMenuSelection}>
      {editable && (
          <Menu.Item key={QUERY_ACTION_TITLE}>
            <Icon type={`file${(hasTitle ? '' : '-text')}` } />
            {(hasTitle ? 'Remove' : 'Add')} Title
          </Menu.Item>)
      }
      {copyable && (
          <Menu.Item key={QUERY_ACTION_COPY}>
            <Icon type="font-size" />
            Copy SQON
          </Menu.Item>)
      }
      <Menu.Item key={QUERY_ACTION_COMPOUND_OPERATORS}>
        <Icon type={`${(compoundOperators ? 'plus' : 'minus')}-circle` } />
        {(compoundOperators ? 'Maximize' : 'Minimize')} View
      </Menu.Item>
      {duplicatable && (
          <Menu.Item key={QUERY_ACTION_DUPLICATE}>
            <Icon type="file-add"/>
            Duplicate
          </Menu.Item>)
      }
      {undoable && original && (
          <Menu.Item key={QUERY_ACTION_UNDO_ALL}>
            <Icon type="undo" />
            Revert Changes
          </Menu.Item>)
      }
      {editable && (
          <Menu.Item key={QUERY_ACTION_VIEW_SQON}>
            <Icon type={`eye${(viewableSqon ? '-invisible' : '')}` } />
            Advanced Editor
          </Menu.Item>)
      }
      {removable && (
          <Menu.Item key={QUERY_ACTION_DELETE}>
            <Icon type="delete"/>
            Delete
          </Menu.Item>)
      }
      </Menu>)
  }

  render() {
    const { options, original, key, onSelectCallback } = this.props;
    const { copyable, duplicatable, removable, undoable } = options;
    const hasMenu = copyable || duplicatable || removable || undoable;
    const { display, data } = this.state;
    const { compoundOperators, viewableSqon } = display;
    const title = !!data.title;
    const isDirty = !isEqual(original, data);
    let operatorsHandler = null;
    if (compoundOperators) {
      const operator = find(data.instructions, ['type', QUERY_ITEM_TYPE_OPERATOR]);
      if (operator) {
        operatorsHandler = (
          <Operator
            key={operator.key}
            options={options}
            data={operator.data}
            onEditCallback={this.handleOperatorChange}
          />
        )
      }
    }
    return data.instructions ? (
      <div className={`query${(isDirty ? ' dirty' : '')}`}>

        {title &&
          <Input
              size={'small'}
              className="title"
              defaultValue={data.title || ''}
              suffix={
                <Tooltip title="Identify this query using a title.">
                  <Icon type="info-circle"/>
                </Tooltip>
              }
              onBlur={this.handleTitleChange}
          />
        }
        <span className="instructions">
            { !viewableSqon && data.instructions.map((item, index) => {
              switch (item.type) {
                case QUERY_ITEM_TYPE_OPERATOR:
                  if (compoundOperators) {
                    return null;
                  }
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
          { viewableSqon && (
              <Input.TextArea
                  value={JSON.stringify(this.sqon())}
                  className="no-drag"
                  rows={4}
                  onChange={this.handleAdvancedChange}
              />
          ) }
          &nbsp;
        </span>
        <span className="actions">
          { hasMenu && (<Divider type="vertical"/>) }
          { compoundOperators && (
              operatorsHandler
          ) }
          { hasMenu && (
              <Dropdown overlay={this.createMenuComponent}>
                <Icon type="more" />
              </Dropdown>
          ) }
        </span>
      </div>
    ) : null;
  }
}

Query.propTypes = {
  key: PropTypes.string,
  draft: PropTypes.shape([]).isRequired,
  original: PropTypes.shape([]).isRequired,
  display: PropTypes.shape({}),
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
  display: {
    compoundOperators: false,
    viewableSqon: false,
  },
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
