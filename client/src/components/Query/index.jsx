/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import {
  cloneDeep, isEqual, find, isNull, filter,
} from 'lodash';
import {
  Input, Tooltip,
} from 'antd';
import uuidv1 from 'uuid/v1';
import copy from 'copy-to-clipboard';

import IconKit from 'react-icons-kit';
import {
  ic_edit, ic_delete, ic_filter_none,
} from 'react-icons-kit/md';
import { INSTRUCTION_TYPE_FILTER } from './Filter/index';
import GenericFilter from './Filter/Generic';
import SpecificFilter from './Filter/Specific';
import NumericalComparisonFilter from './Filter/NumericalComparison';
import CompositeFilter from './Filter/Composite';
import GenericBooleanFilter from './Filter/GenericBoolean';
import Operator, {
  createOperatorInstruction,
  INSTRUCTION_TYPE_OPERATOR,
  OPERATOR_TYPE_AND_NOT,
  OPERATOR_TYPE_DEFAULT,
} from './Operator';
import Subquery, { INSTRUCTION_TYPE_SUBQUERY } from './Subquery';
import {
  FILTER_TYPE_GENERIC, FILTER_TYPE_NUMERICAL_COMPARISON, FILTER_TYPE_GENERICBOOL, FILTER_TYPE_COMPOSITE, FILTER_TYPE_SPECIFIC,
} from './Filter/index';

import styleQuery from './query.module.scss';

const QUERY_ACTION_COPY = 'copy';
const QUERY_ACTION_UNDO_ALL = 'undo-all';
const QUERY_ACTION_DELETE = 'delete';
const QUERY_ACTION_DUPLICATE = 'duplicate';
const QUERY_ACTION_COMPOUND_OPERATORS = 'compound-operators';
const QUERY_ACTION_TITLE = 'title';

export const sanitizeInstructions = (instructions) => {
  instructions = sanitizeSubqueries(instructions);
  instructions = sanitizeFilters(instructions);
  instructions = sanitizeOperators(instructions);
  return instructions;
};

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

  const operator = find(sanitizedInstructions, { type: INSTRUCTION_TYPE_OPERATOR });
  const operatorType = operator ? operator.data.type : OPERATOR_TYPE_DEFAULT;
  // @NOTE No subsequent filters or subqueries without an operator
  for (const i in sanitizedInstructions) {
    const next = Number(i) + 1;
    if (next < sanitizedInstructions.length) {
      if (sanitizedInstructions[i].type === INSTRUCTION_TYPE_FILTER || sanitizedInstructions[i].type === INSTRUCTION_TYPE_SUBQUERY) {
        if (sanitizedInstructions[next].type === INSTRUCTION_TYPE_FILTER || sanitizedInstructions[next].type === INSTRUCTION_TYPE_SUBQUERY) {
          sanitizedInstructions.splice(next, 0, createOperatorInstruction(operatorType));
        }
      }
    }
  }

  return sanitizedInstructions;
};

const sanitizeSubqueries = (instructions) => {
  const subqueries = find(instructions, { type: INSTRUCTION_TYPE_SUBQUERY });

  // @NOTE No single subqueries
  if (subqueries && subqueries.length === 1) {
    instructions.shift();
  }

  return instructions;
};

// @NOTE No subsequent filters
const sanitizeFilters = instructions => instructions;


class Query extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      onFocus: false,
      title: null,
    };
    this.addInstruction = this.addInstruction.bind(this);
    this.replaceInstruction = this.replaceInstruction.bind(this);
    this.removeInstruction = this.removeInstruction.bind(this);
    this.handleFilterRemoval = this.handleFilterRemoval.bind(this);
    this.handleOperatorRemoval = this.handleOperatorRemoval.bind(this);
    this.handleSubqueryRemoval = this.handleSubqueryRemoval.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleOperatorChange = this.handleOperatorChange.bind(this);
    this.handleSubqueryChange = this.handleSubqueryChange.bind(this);
    this.serialize = this.serialize.bind(this);
    this.sqon = this.sqon.bind(this);
    this.json = this.json.bind(this);
    this.handleMenuSelection = this.handleMenuSelection.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.hasTitle = this.hasTitle.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.onChange = this.onChange.bind(this);
    this.getTitleWidth = this.getTitleWidth.bind(this);
  }

  addInstruction(instruction) {
    // @NOTE Cannot add new filters to a query using an exclusion operator; not implemented yet.
    const { draft } = this.props;
    const andNotOperator = find(draft.instructions, instruction => (instruction.type === INSTRUCTION_TYPE_OPERATOR && instruction.data.type === OPERATOR_TYPE_AND_NOT));
    if (!andNotOperator) {
      const { display, index, onEditCallback } = this.props;
      const newDraft = cloneDeep(draft);
      newDraft.instructions.push(instruction);
      newDraft.instructions = sanitizeInstructions(newDraft.instructions);
      onEditCallback({
        data: newDraft,
        display,
        index,
      });
    }
  }

  replaceInstruction(instruction) {
    const {
      draft, display, index, onEditCallback,
    } = this.props;
    const newDraft = cloneDeep(draft);
    const instructionIndex = instruction.index;

    newDraft.instructions[instructionIndex] = instruction;
    newDraft.instructions = sanitizeInstructions(newDraft.instructions);
    onEditCallback({
      data: newDraft,
      display,
      index,
    });
  }

  removeInstruction(instruction) {
    const {
      draft, display, index, onEditCallback,
    } = this.props;
    const newDraft = cloneDeep(draft);
    const instructionIndex = instruction.index;

    newDraft.instructions.splice(instructionIndex, 1);
    newDraft.instructions = sanitizeInstructions(newDraft.instructions);
    onEditCallback({
      data: newDraft,
      display,
      index,
    });
  }

  handleFilterRemoval(filter) {
    this.removeInstruction(filter);
  }

  handleOperatorRemoval(operator) {
    this.removeInstruction(operator);
  }

  handleSubqueryRemoval(subquery) {
    this.removeInstruction(subquery);
  }

  handleFilterChange(filter) {
    const instruction = {
      type: INSTRUCTION_TYPE_FILTER,
      data: filter,
    };
    if (!isNull(filter.index)) {
      instruction.index = filter.index;
      this.replaceInstruction(instruction);
    } else {
      this.addInstruction(instruction);
    }
  }

  // @NOTE All operators within a query must have the same type
  handleOperatorChange(operator) {
    const {
      draft, display, index, onEditCallback,
    } = this.props;
    const updatedDraft = cloneDeep(draft);
    updatedDraft.instructions = updatedDraft.instructions.map((datum) => {
      if (datum.type === INSTRUCTION_TYPE_OPERATOR) {
        datum.data.type = operator.data.type;
      }

      return datum;
    });

    updatedDraft.instructions = sanitizeInstructions(updatedDraft.instructions);
    onEditCallback({
      data: updatedDraft,
      display,
      index,
    });
  }

  handleSubqueryChange(subquery) {
    this.replaceInstruction({
      type: INSTRUCTION_TYPE_SUBQUERY,
      index: subquery.index,
      data: subquery.data,
      options: subquery.options,
    });
  }

  handleTitleChange(e) {
    const title = e.target.value;
    const { draft, onEditCallback } = this.props;
    e.target.blur();
    if (title !== draft.title) {
      const serialized = this.serialize();
      serialized.data.title = title;
      onEditCallback(serialized);
    }
    this.setState({ onFocus: false });
  }

  onFocus(e) {
    const { onFocus } = this.state;
    e.target.select();
    this.setState({ onFocus: true });
  }

  onChange(e) {
    const { value } = e.target;
    const length = (value.length);
    const width = this.getTitleWidth(value);

    e.target.style.width = `calc(15px + ${width}ch)`;
  }

  handleFocus() {
    const { draft } = this.props;
    const input = document.querySelector(`.title-${draft.key}`);
    input.focus();
  }

  json() {
    const { draft } = this.props;
    const sqon = this.sqon();
    return { ...draft, instructions: sqon };
  }

  sqon() {
    const { draft } = this.props;
    const sqon = draft.instructions.map((datum) => {
      delete datum.key;
      delete datum.display;
      delete datum.data.index;
      return datum;
    });
    return sqon;
  }

  serialize() {
    const { draft, display, index } = this.props;
    return {
      data: draft,
      display,
      index,
    };
  }

  handleClick(e) {
    const { onClickCallback, draft } = this.props;
    onClickCallback(draft.key);
  }

  handleMenuSelection({ key }) {
    const { display, draft, index } = this.props;
    switch (key) {
      case QUERY_ACTION_COPY:
        const sqon = JSON.stringify(this.sqon());
        copy(sqon);
        this.props.onCopyCallback(sqon);
        break;
      case QUERY_ACTION_COMPOUND_OPERATORS:
        const updatedDisplayCompoundOperators = {
          ...display,
          compoundOperators: !display.compoundOperators,
        };
        this.props.onDisplayCallback({ display: updatedDisplayCompoundOperators, index });
        break;
      case QUERY_ACTION_TITLE:
        const newDraft = cloneDeep(draft);
        if (!this.hasTitle()) {
          newDraft.title = '';
        } else {
          delete newDraft.title;
        }
        this.props.onEditCallback({
          data: newDraft,
          display,
          index,
        });
        break;
      case QUERY_ACTION_DELETE:
        this.props.onRemoveCallback(draft.key);
        break;
      case QUERY_ACTION_DUPLICATE:
        this.props.onDuplicateCallback(this.serialize());
        break;
      case QUERY_ACTION_UNDO_ALL:
        const { original } = this.props;
        const clone = cloneDeep(original);
        this.props.onEditCallback(clone);
        break;
      default:
        break;
    }
  }

  hasTitle() {
    const { draft } = this.props;
    return draft.title !== undefined;
  }

  getTitleWidth(value) {
    const x0 = ['i', 'l', 'j', ';', ',', '|', ' '];
    const x1 = ['t', 'I', ':', '.', '[', ']', '-', '/', '!', '"'];
    const x2 = ['r', 'f', '(', ')', '{', '}'];
    const x3 = ['v', 'x', 'y', 'z', '_', '*', '»', '«'];
    const x4 = ['c', 'k', 's'];
    const x5 = ['g', 'p', 'q', 'b', 'd', 'h', 'n', 'u', 'û', 'ù', 'ü', 'o', 'ô', 'ö', 'E', 'Ê', 'É', 'È', 'Ë', 'J', '+', '=', '$', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    const x6 = ['T', 'S', 'Y', 'Z'];
    const x7 = ['K', 'X', 'B', 'R', 'P', '&', '#'];
    const x8 = ['U', 'Ù', 'Ü', 'Û', 'V', 'C', 'D'];
    const x9 = ['A'];
    const x10 = ['G', 'O', 'Q'];
    const x11 = ['H', 'N'];
    const x12 = ['w', '%'];
    const x13 = ['m', 'M'];
    const x14 = ['W'];

    let numberOf_X0_Letter = 0;
    let numberOf_X1_Letter = 0;
    let numberOf_X2_Letter = 0;
    let numberOf_X3_Letter = 0;
    let numberOf_X4_Letter = 0;
    let numberOf_X_Letter = 0;
    let numberOf_X5_Letter = 0;
    let numberOf_X6_Letter = 0;
    let numberOf_X7_Letter = 0;
    let numberOf_X8_Letter = 0;
    let numberOf_X9_Letter = 0;
    let numberOf_X10_Letter = 0;
    let numberOf_X11_Letter = 0;
    let numberOf_X12_Letter = 0;
    let numberOf_X13_Letter = 0;
    let numberOf_X14_Letter = 0;

    const map = Array.prototype.map;
    map.call(value, (eachLetter) => {
      if (x0.includes(eachLetter)) {
        numberOf_X0_Letter += 1;
      } else if (x1.includes(eachLetter)) {
        numberOf_X1_Letter += 1;
      } else if (x2.includes(eachLetter)) {
        numberOf_X2_Letter += 1;
      } else if (x3.includes(eachLetter)) {
        numberOf_X3_Letter += 1;
      } else if (x4.includes(eachLetter)) {
        numberOf_X4_Letter += 1;
      } else if (x5.includes(eachLetter)) {
        numberOf_X5_Letter += 1;
      } else if (x6.includes(eachLetter)) {
        numberOf_X6_Letter += 1;
      } else if (x7.includes(eachLetter)) {
        numberOf_X7_Letter += 1;
      } else if (x8.includes(eachLetter)) {
        numberOf_X8_Letter += 1;
      } else if (x9.includes(eachLetter)) {
        numberOf_X9_Letter += 1;
      } else if (x10.includes(eachLetter)) {
        numberOf_X10_Letter += 1;
      } else if (x11.includes(eachLetter)) {
        numberOf_X11_Letter += 1;
      } else if (x12.includes(eachLetter)) {
        numberOf_X12_Letter += 1;
      } else if (x13.includes(eachLetter)) {
        numberOf_X13_Letter += 1;
      } else if (x14.includes(eachLetter)) {
        numberOf_X14_Letter += 1;
      } else {
        numberOf_X_Letter += 1;
      }
    });
    const width = (numberOf_X0_Letter * 0.47) + (numberOf_X1_Letter * 0.6) + (numberOf_X2_Letter * 0.64) + (numberOf_X3_Letter * 0.90) + (numberOf_X4_Letter * 0.94)
                    + (numberOf_X_Letter * 0.98) + (numberOf_X5_Letter * 1.02) + (numberOf_X6_Letter * 1.1) + (numberOf_X7_Letter * 1.14) + (numberOf_X8_Letter * 1.17) + (numberOf_X9_Letter * 1.20)
                    + (numberOf_X10_Letter * 1.24) + (numberOf_X11_Letter * 1.29) + (numberOf_X12_Letter * 1.33) + (numberOf_X13_Letter * 1.56) + (numberOf_X14_Letter * 1.58);
    return width;
  }


  render() {
    const {
      active, options, original, onSelectCallback, findQueryIndexForKey, findQueryTitle, results, intl, facets, categories, draft, externalData,
    } = this.props;
    const {
      copyable, removable,
    } = options;
    const { onFocus } = this.state;
    const isDirty = !isEqual(original, draft);

    const duplicateText = intl.formatMessage({ id: 'screen.patientvariant.query.menu.duplicate' });
    const deleteText = intl.formatMessage({ id: 'screen.patientvariant.query.menu.delete' });
    const editTitleText = intl.formatMessage({ id: 'screen.patientvariant.query.menu.editTitle' });
    const width = draft.title ? this.getTitleWidth(draft.title) : 0;
    const classNames = [styleQuery.query];

    if (isDirty) { classNames.push(styleQuery.dirtyQuery); }
    if (active) { classNames.push(styleQuery.activeQuery); } else { classNames.push(styleQuery.inactiveQuery); }
    return (
      <div className={classNames.join(' ')} onClick={this.handleClick}>
        <div className={styleQuery.toolbar}>
          <Tooltip title={editTitleText}>
            <div className={styleQuery.title}>
              <Input
                size="small"
                defaultValue={draft.title}
                onBlur={this.handleTitleChange}
                onFocus={this.onFocus}
                onPressEnter={this.handleTitleChange}
                onChange={this.onChange}
                className={`title-${draft.key}`}
                style={{ width: `calc(14px + ${width}ch)` }}
              />
              <IconKit
                icon={ic_edit}
                size={14}
                className={`${styleQuery.iconTitle} ${styleQuery.icon} ${onFocus ? `${styleQuery.focusIcon}` : null}`}
                onClick={this.handleFocus}
              />
            </div>
          </Tooltip>
          <div className={styleQuery.actions}>
            {copyable && (
            <Tooltip title={duplicateText}>
              <IconKit icon={ic_filter_none} size={16} className={styleQuery.icon} onClick={() => { this.handleMenuSelection({ key: QUERY_ACTION_DUPLICATE }); }} />
            </Tooltip>
            )}
            {removable && (
            <Tooltip title={deleteText}>
              <IconKit icon={ic_delete} size={16} className={styleQuery.icon} onClick={() => { this.handleMenuSelection({ key: QUERY_ACTION_DELETE }); }} />
            </Tooltip>
            )}
          </div>
          <div className={styleQuery.count}>
            { results && (<span>{results.toLocaleString('en-US').replace(',', '\u00a0')}</span>) }
          </div>
        </div>
        {draft.instructions.length === 0
          ? (
            <div className={styleQuery.emptyQuery}>
                Utilisez le champ de recherche ou les facettes à gauche afin de créer votre requête
            </div>
          )
          : (
            <div className={styleQuery.instructions}>
              { draft.instructions.map((item, index) => {
                switch (item.type) {
                  case INSTRUCTION_TYPE_OPERATOR:
                    return (
                      <Operator
                        index={index}
                        options={options}
                        data={item.data}
                        intl={intl}
                        onEditCallback={this.handleOperatorChange}
                        key={uuidv1()}
                      />
                    );
                  case INSTRUCTION_TYPE_FILTER:
                    let category = null;
                    let type = null;
                    categories.map((x, index) => {
                      const value = find(x.filters, ['id', item.data.id]);
                      if (value) {
                        category = x.id;
                        type = value.type;
                      }
                    });
                    if (type === FILTER_TYPE_GENERIC) {
                      const categoryInfo = find(categories, ['id', category]);
                      const categoryData = find(categoryInfo.filters, ['id', item.data.id]);
                      return (
                        <GenericFilter
                          index={index}
                          options={options}
                          autoSelect={active}
                          data={item.data}
                          dataSet={facets[item.data.id] || []}
                          config={categoryData.config && categoryData.config[categoryData.id]}
                          intl={intl}
                          category={category}
                          onEditCallback={this.handleFilterChange}
                          onRemoveCallback={this.handleFilterRemoval}
                          onSelectCallback={onSelectCallback}
                          key={uuidv1()}
                        />
                      );
                    } if (type === FILTER_TYPE_NUMERICAL_COMPARISON) {
                      return (
                        <NumericalComparisonFilter
                          index={index}
                          options={options}
                          autoSelect={active}
                          data={item.data}
                          dataSet={facets[item.data.id] || []}
                          intl={intl}
                          category={category}
                          onEditCallback={this.handleFilterChange}
                          onRemoveCallback={this.handleFilterRemoval}
                          onSelectCallback={onSelectCallback}
                          key={uuidv1()}
                        />
                      );
                    } if (type === FILTER_TYPE_GENERICBOOL) {
                      const categoryInfo = find(categories, ['id', category]);
                      const categoryData = find(categoryInfo.filters, ['id', item.data.id]);
                      const allOption = [];
                      Object.keys(categoryData.search).map((keyName) => {
                        const datum = facets[keyName];
                        if (datum && datum[0]) {
                          allOption.push({
                            value: keyName,
                            count: datum[0].count,
                          });
                        }
                      });
                      return (
                        <GenericBooleanFilter
                          index={index}
                          options={options}
                          autoSelect={active}
                          data={item.data}
                          dataSet={allOption || []}
                          intl={intl}
                          category={category}
                          onEditCallback={this.handleFilterChange}
                          onRemoveCallback={this.handleFilterRemoval}
                          onSelectCallback={onSelectCallback}
                          key={uuidv1()}
                        />
                      );
                    } if (type === FILTER_TYPE_COMPOSITE) {
                      return (
                        <CompositeFilter
                          index={index}
                          options={options}
                          autoSelect={active}
                          data={item.data}
                          dataSet={facets[item.data.id] || []}
                          intl={intl}
                          category={category}
                          onEditCallback={this.handleFilterChange}
                          onRemoveCallback={this.handleFilterRemoval}
                          onSelectCallback={onSelectCallback}
                          key={uuidv1()}
                        />
                      );
                    } if (type === FILTER_TYPE_SPECIFIC) {
                      const categoryInfo = find(categories, ['id', category]);
                      const categoryData = find(categoryInfo.filters, ['id', item.data.id]);
                      return (
                        <SpecificFilter
                          index={index}
                          options={options}
                          autoSelect={active}
                          data={item.data}
                          dataSet={facets[item.data.id] || []}
                          config={categoryData.config && categoryData.config[categoryData.id]}
                          intl={intl}
                          category={category}
                          onEditCallback={this.handleFilterChange}
                          onRemoveCallback={this.handleFilterRemoval}
                          onSelectCallback={onSelectCallback}
                          externalDataSet={externalData}
                          key={uuidv1()}
                        />
                      );
                    }
                    break;

                  case INSTRUCTION_TYPE_SUBQUERY:
                    const queryIndex = findQueryIndexForKey ? findQueryIndexForKey(item.data.query) : null;
                    const queryTitle = findQueryTitle ? findQueryTitle(item.data.query) : null;
                    return (
                      <Subquery
                        index={index}
                        options={options}
                        data={item.data}
                        intl={intl}
                        autoSelect={active}
                        queryIndex={queryIndex}
                        queryTitle={queryTitle}
                        onEditCallback={this.handleSubqueryChange}
                        onRemoveCallback={this.handleSubqueryRemoval}
                        onSelectCallback={onSelectCallback}
                        key={uuidv1()}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </div>
          )
        }
      </div>
    );
  }
}

Query.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  draft: PropTypes.shape([]).isRequired,
  original: PropTypes.shape([]),
  display: PropTypes.shape({}),
  options: PropTypes.shape({}),
  active: PropTypes.bool,
  results: PropTypes.number,
  externalData: PropTypes.shape({}),
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
  original: [],
  display: {
    compoundOperators: false,
    viewableSqon: false,
    viewableSqonIsValid: true,
  },
  options: {
    copyable: true,
    duplicatable: true,
    editable: true,
    removable: true,
    undoable: true,
  },
  active: false,
  results: null,
  externalData: {},
  onClickCallback: () => {},
  onCopyCallback: () => {},
  onDisplayCallback: () => {},
  onEditCallback: () => {},
  onDuplicateCallback: () => {},
  onRemoveCallback: () => {},
  onSelectCallback: () => {},
  onUndoCallback: () => {},
  findQueryIndexForKey: null,
};

export default Query;
