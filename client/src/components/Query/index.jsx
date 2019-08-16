/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { cloneDeep, isEqual, find } from 'lodash';
import {
  Dropdown, Icon, Menu, Input, Tooltip, Divider, Badge,
} from 'antd';
import copy from 'copy-to-clipboard';
const Joi = require('@hapi/joi');

import './style.scss';
import Filter, { INSTRUCTION_TYPE_FILTER } from './Filter/index';
import Operator, { INSTRUCTION_TYPE_OPERATOR } from './Operator';
import Subquery, { INSTRUCTION_TYPE_SUBQUERY } from './Subquery';
import { convertIndexToColor } from './Statement';


export const DEFAULT_EMPTY_QUERY = [];

const QUERY_ACTION_COPY = 'copy';
const QUERY_ACTION_UNDO_ALL = 'undo-all';
const QUERY_ACTION_DELETE = 'delete';
const QUERY_ACTION_DUPLICATE = 'duplicate';
const QUERY_ACTION_COMPOUND_OPERATORS = 'compound-operators';
const QUERY_ACTION_VIEW_SQON = 'view-sqon';
const QUERY_ACTION_TITLE = 'title';

const sanitizeOperators = (instructions) => {
  // @NOTE No subsequent operators
  let lastOperatorIndex = null;
  const sanitizedInstructions = instructions.filter((instruction, index) => {
    if (instruction.type === INSTRUCTION_TYPE_OPERATOR) {
      if (lastOperatorIndex !== null && ((lastOperatorIndex + 1) === index)) {
        lastOperatorIndex = index;
        return false;
      }
      lastOperatorIndex = index;
    }
    return true;
  });

  // @NOTE No prefix operator
  if (sanitizedInstructions[0] && sanitizedInstructions[0].type === INSTRUCTION_TYPE_OPERATOR) {
    sanitizedInstructions.shift();
  }

  // @NOTE No suffix operator
  const instructionsLength = sanitizedInstructions.length - 1;
  if (sanitizedInstructions[instructionsLength] && sanitizedInstructions[instructionsLength].type === INSTRUCTION_TYPE_OPERATOR) {
    sanitizedInstructions.pop();
  }

  return sanitizedInstructions;
};

const sanitizeSubqueries = (instructions) => {
  if (instructions.length === 1 && instructions[0].type === INSTRUCTION_TYPE_SUBQUERY) {
    instructions.shift();
  }

  return instructions;
};

// @NOTE No subsequent filters
const sanitizeFilters = instructions => instructions;


class Query extends React.Component {
  constructor() {
    super();
    this.state = {
      data: null,
      display: null,
    };
    this.replaceItem = this.replaceItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.handleFilterRemoval = this.handleFilterRemoval.bind(this);
    this.handleOperatorRemoval = this.handleOperatorRemoval.bind(this);
    this.handleSubqueryRemoval = this.handleSubqueryRemoval.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleOperatorChange = this.handleOperatorChange.bind(this);
    this.handleSubqueryChange = this.handleSubqueryChange.bind(this);
    this.serialize = this.serialize.bind(this);
    this.sqon = this.sqon.bind(this);
    this.json = this.json.bind(this);
    this.createMenuComponent = this.createMenuComponent.bind(this);
    this.handleMenuSelection = this.handleMenuSelection.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleAdvancedChange = this.handleAdvancedChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
    const { display, draft } = this.props;
    this.setState({
      data: draft,
      display,
    });
  }

  replaceItem(item, index = null) {
    const { data } = this.state;
    const { onEditCallback } = this.props;
    if (index === null) {
      index = item.index;
    }
    data.instructions[index] = item;
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
    data.instructions = sanitizeOperators(data.instructions);
    data.instructions = sanitizeSubqueries(data.instructions);
    if (data.instructions.length > 0) {
      this.setState({
        data,
      }, () => {
        if (onEditCallback) {
          onEditCallback(this.serialize());
        }
      });
    } else if (onRemoveCallback) {
      onRemoveCallback(this.serialize());
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
      type: INSTRUCTION_TYPE_FILTER,
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
      if (datum.type === INSTRUCTION_TYPE_OPERATOR) {
        datum.data.type = operator.data.type;
      }
      return datum;
    });
    this.setState({
      data,
    }, () => {
      if (onEditCallback) {
        onEditCallback(this.serialize());
      }
    });
  }

  handleSubqueryChange(subquery) {
    this.replaceItem({
      type: INSTRUCTION_TYPE_SUBQUERY,
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
    });
  }

  handleAdvancedChange(e) {
    const { options } = this.props;
    const { editable } = options;
    if (editable) {
      const {value} = e.target;
      try {
        const rawQuery = JSON.parse(value);
        const QuerySchema = Joi.object().keys({
          title: Joi.string(),
          instructions: Joi.array().items(Joi.object().keys({
            type: Joi.string().valid(INSTRUCTION_TYPE_FILTER, INSTRUCTION_TYPE_OPERATOR, INSTRUCTION_TYPE_SUBQUERY).required(),

            /*
            filter: Joi.string().when(
              'type', {
                is: INSTRUCTION_TYPE_FILTER,
                then: Joi.object().keys({
                  data: Joi.object().keys({
                    id: Joi.string().required(),
                    type: Joi.string().valid('generic', 'specific').required(),
                    operand: Joi.string().valid('all', 'one', 'none').required(),
                    values: Joi.array().items(Joi.string()).required(),
                  }).required()
                })
              }),
              */

            operator: Joi.string().when(
              'type', {
                is: INSTRUCTION_TYPE_OPERATOR,
                then: Joi.object({
                  data: Joi.object({
                    //type: Joi.string().valid('and', 'or').required()
                  })
              })
            }),
            /*
            subquery: Joi.string().when(
              'type', {
                is: INSTRUCTION_TYPE_SUBQUERY,
                then: Joi.object().keys({
                  data: Joi.object().keys({
                    type: Joi.string().valid('generic', 'specific').required(),
                  }).required()
                })
              }),
              */
        }))});

        const validation = Joi.validate(rawQuery, QuerySchema);
        console.log(' valid schema? ')
        console.log( validation )
        if (!validation.error) {

          console.log(rawQuery)

          this.setState({
            data: cloneDeep(rawQuery),
          }, () => {
            if (this.props.onEditCallback) {
              this.props.onEditCallback(this.serialize());
            }
          });
        }
      } catch (e) { console.log(e) }
    }
  }

  json() {
    const { data } = this.state;
    const instructions = data.instructions.map((datum) => {
      delete datum.key;
      delete datum.display;
      return datum;
    });
    return { ...data, instructions };
  }

  sqon() {
    const { data } = this.state;
    const sqon = data.instructions.map((datum) => {
      delete datum.key;
      delete datum.display;
      return datum;
    });
    return sqon;
  }

  serialize() {
    const { data, display } = this.state;
    const { index } = this.props;
    return {
      data,
      display,
      index,
    };
  }

  handleClick(e) {
    const { onClickCallback } = this.props;
    if (onClickCallback) {
      onClickCallback(this.serialize())
    }
  }

  handleMenuSelection({ key }) {
    const { display } = this.state;
    const { data } = this.state;
    switch (key) {
      case QUERY_ACTION_COPY:
        const sqon = JSON.stringify(this.sqon());
        copy(sqon);
        if (this.props.onCopyCallback) {
          this.props.onCopyCallback(sqon);
        }
        break;
      case QUERY_ACTION_VIEW_SQON:
        display.viewableSqon = !display.viewableSqon;
        this.setState({
          display,
        }, () => {
          if (this.props.onDisplayCallback) {
            this.props.onDisplayCallback(this.serialize());
          }
        });
        break;
      case QUERY_ACTION_COMPOUND_OPERATORS:
        display.compoundOperators = !display.compoundOperators;
        this.setState({
          display,
        }, () => {
          if (this.props.onDisplayCallback) {
            this.props.onDisplayCallback(this.serialize());
          }
        });
        break;
      case QUERY_ACTION_TITLE:
        if (!data.title) {
          data.title = 'Untitled';
        } else {
          delete data.title;
        }
        this.setState({
          data,
        }, () => {
          if (this.props.onEditCallback) {
            this.props.onEditCallback(this.serialize());
          }
        });
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
        });
        break;
      default:
        break;
    }
  }

  createMenuComponent() {
    const { options, original } = this.props;
    const { display, data } = this.state;
    const {
      copyable, duplicatable, editable, removable, undoable,
    } = options;
    const { compoundOperators, viewableSqon } = display;
    const hasTitle = !!data.title;

    return (
      <Menu onClick={this.handleMenuSelection}>
        {editable && (
        <Menu.Item key={QUERY_ACTION_TITLE}>
          <Icon type={`file${(hasTitle ? '' : '-text')}`} />
          {(hasTitle ? 'Remove' : 'Add')}
          {' '}
Title
        </Menu.Item>
        )
      }
        {copyable && (
        <Menu.Item key={QUERY_ACTION_COPY}>
          <Icon type="font-size" />
            Copy SQON
        </Menu.Item>
        )
      }
        <Menu.Item key={QUERY_ACTION_COMPOUND_OPERATORS}>
          <Icon type={`${(compoundOperators ? 'plus' : 'minus')}-circle`} />
          {(compoundOperators ? 'Maximize' : 'Minimize')}
          {' '}
View
        </Menu.Item>
        {duplicatable && (
        <Menu.Item key={QUERY_ACTION_DUPLICATE}>
          <Icon type="file-add" />
            Duplicate
        </Menu.Item>
        )
      }
        {undoable && original && (
        <Menu.Item key={QUERY_ACTION_UNDO_ALL}>
          <Icon type="undo" />
            Revert Changes
        </Menu.Item>
        )
      }
        {editable && (
        <Menu.Item key={QUERY_ACTION_VIEW_SQON}>
          <Icon type={`eye${(viewableSqon ? '-invisible' : '')}`} />
            Advanced Editor
        </Menu.Item>
        )
      }
        {removable && (
        <Menu.Item key={QUERY_ACTION_DELETE}>
          <Icon type="delete" />
            Delete
        </Menu.Item>
        )
      }
      </Menu>
    );
  }

  render() {
    const { active, options, original, onSelectCallback, findQueryIndexForKey, results } = this.props;
    const {
      copyable, duplicatable, removable, undoable,
    } = options;
    const hasMenu = copyable || duplicatable || removable || undoable;
    const { display, data } = this.state;
    const { compoundOperators, viewableSqon } = display;
    const title = !!data.title;
    const isDirty = !isEqual(original, data);
    let operatorsHandler = null;
    if (compoundOperators) {
      const operator = find(data.instructions, {'type': INSTRUCTION_TYPE_OPERATOR});
      if (operator) {
        operatorsHandler = (
          <Operator
            key={operator.key}
            options={options}
            data={operator.data}
            onEditCallback={this.handleOperatorChange}
          />
        );
      }
    }
    const query = data.instructions ? (
      <div className={`query${(isDirty ? ' dirty' : '')}`} onClick={this.handleClick}>
        {title
          && (
          <Input
            size="small"
            className="title"
            allowClear
            defaultValue={data.title || ''}
            onBlur={this.handleTitleChange}
          />
          )
        }
        <div className="instructions">
          { !viewableSqon && data.instructions.map((item, index) => {
            switch (item.type) {
              case INSTRUCTION_TYPE_OPERATOR:
                if (compoundOperators) {
                  return null;
                }
                return (
                  <Operator
                    index={index}
                    options={options}
                    data={item.data}
                    onEditCallback={this.handleOperatorChange}
                  />
                );
              case INSTRUCTION_TYPE_FILTER:
                return (
                  <Filter
                    index={index}
                    options={options}
                    data={item.data}
                    onEditCallback={this.handleFilterChange}
                    onRemoveCallback={this.handleFilterRemoval}
                    onSelectCallback={onSelectCallback}
                  />
                );
              case INSTRUCTION_TYPE_SUBQUERY:
                return (
                  <Subquery
                    index={index}
                    queryIndex={(findQueryIndexForKey ? findQueryIndexForKey(item.data.query) : null)}
                    queryColor={ active && findQueryIndexForKey ? convertIndexToColor(findQueryIndexForKey(item.data.query)) : null }
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
            value={JSON.stringify(this.json())}
            className="no-drag"
            rows={4}
            onChange={this.handleAdvancedChange}
          />
          ) }
          &nbsp;
        </div>
        <div className="actions">
          { compoundOperators && ( operatorsHandler ) }
          { hasMenu && (<Divider type="vertical" />) }
          { hasMenu && (
          <Dropdown overlay={this.createMenuComponent}>
            <Icon type="more" />
          </Dropdown>
          ) }
        </div>
      </div>
    ) : null;
    return !!results ? <Badge className={( active ? 'active' : 'inactive' )} count={results} overflowCount={9999}>{query}</Badge> : query
  }
}

Query.propTypes = {
  key: PropTypes.string,
  draft: PropTypes.shape([]).isRequired,
  original: PropTypes.shape([]).isRequired,
  display: PropTypes.shape({}),
  options: PropTypes.shape({}),
  active: PropTypes.bool,
  results: PropTypes.string,
  onClickCallback: PropTypes.func,
  onCopyCallback: PropTypes.func,
  onDisplayCallback: PropTypes.func,
  onEditCallback: PropTypes.func,
  onDuplicateCallback: PropTypes.func,
  onRemoveCallback: PropTypes.func,
  onSelectCallback: PropTypes.func,
  onUndoCallback: PropTypes.func,
  findQueryIndexForKey: PropTypes.func,
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
  active: false,
  results: null,
  onClickCallback: null,
  onCopyCallback: null,
  onDisplayCallback: null,
  onEditCallback: null,
  onDuplicateCallback: null,
  onRemoveCallback: null,
  onSelectCallback: null,
  onUndoCallback: null,
  findQueryIndexForKey: null,
};

export default Query;
