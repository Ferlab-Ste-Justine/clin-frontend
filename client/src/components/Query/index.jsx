/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { cloneDeep, isEqual, find, isNull } from 'lodash';
import {
  Dropdown, Icon, Menu, Input, Badge,
} from 'antd';
import copy from 'copy-to-clipboard';
const Joi = require('@hapi/joi');

import { INSTRUCTION_TYPE_FILTER } from './Filter/index';
import GenericFilter from './Filter/Generic';
import SpecificFilter from './Filter/Specific';
import NumericalComparisonFilter from './Filter/NumericalComparison';
import CompositeFilter from './Filter/Composite';
import GenericBooleanFilter from './Filter/GenericBoolean'
import Operator, { INSTRUCTION_TYPE_OPERATOR } from './Operator';
import Subquery, { INSTRUCTION_TYPE_SUBQUERY } from './Subquery';
import {convertIndexToColor, convertIndexToLetter} from './Statement';
import {FILTER_TYPE_GENERIC , FILTER_TYPE_NUMERICAL_COMPARISON, FILTER_TYPE_GENERICBOOL, FILTER_TYPE_COMPOSITE, FILTER_TYPE_SPECIFIC} from './Filter/index'
import IconKit from 'react-icons-kit';
import {
  ic_edit, ic_delete, ic_filter_none,
} from 'react-icons-kit/md';

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
}

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

  // @No subsequent filters or subqueries without an operator
  for(let i in sanitizedInstructions){
    const defaultOperator = {data:{type:"and"} ,
                             type:INSTRUCTION_TYPE_OPERATOR }
    const operator = find(sanitizedInstructions, ['type', INSTRUCTION_TYPE_OPERATOR]) ? find(sanitizedInstructions, ['type', INSTRUCTION_TYPE_OPERATOR]) : defaultOperator
    const next = Number(i)+1
    if(next < sanitizedInstructions.length){
        if(sanitizedInstructions[i].type === INSTRUCTION_TYPE_FILTER || sanitizedInstructions[i].type === INSTRUCTION_TYPE_SUBQUERY){
            if(sanitizedInstructions[next].type === INSTRUCTION_TYPE_FILTER || sanitizedInstructions[next].type === INSTRUCTION_TYPE_SUBQUERY){
                sanitizedInstructions.splice(next, 0, operator);
            }
        }
    }
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
  constructor(props) {
    super(props);
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
  }

  addInstruction(instruction) {
      const { draft, display, index, onEditCallback } = this.props;
      const newDraft = cloneDeep(draft)
      newDraft.instructions.push(instruction);
      newDraft.instructions = sanitizeInstructions(newDraft.instructions);
      onEditCallback({
        data: newDraft,
        display,
        index
      });
  }

  replaceInstruction(instruction) {
    const { draft, display, index, onEditCallback } = this.props;
    const newDraft = cloneDeep(draft)
    const instructionIndex = instruction.index;

    newDraft.instructions[instructionIndex] = instruction;
    newDraft.instructions = sanitizeInstructions(newDraft.instructions);
    onEditCallback({
      data: newDraft,
      display,
      index
    });
  }

  removeInstruction(instruction) {
    const { draft, display, index, onEditCallback } = this.props;
    const newDraft = cloneDeep(draft)
    const instructionIndex = instruction.index;

    newDraft.instructions.splice(instructionIndex, 1);
    newDraft.instructions = sanitizeInstructions(newDraft.instructions);
    onEditCallback({
      data: newDraft,
      display,
      index
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
      data: filter
    };
    if (!isNull(filter.index)) {
      instruction.index = filter.index
      this.replaceInstruction(instruction);
    } else {
      this.addInstruction(instruction)
    }
  }

  // @NOTE All operators within a query must have the same type
  handleOperatorChange(operator) {
    const { draft, onEditCallback } = this.props;
    const instructions = draft.instructions.map((datum) => {
      if (datum.type === INSTRUCTION_TYPE_OPERATOR) {
        datum.data.type = operator.data.type;
      }
      return datum;
    });
    const updatedDraft = {
      ...draft,
      instructions
    }
    onEditCallback(updatedDraft);
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
    if (title !== draft.title) {
      const serialized = this.serialize();
      serialized.data.title = title;
      onEditCallback(serialized);
    }
  }

  json() {
    const { draft } = this.props;
    const sqon = this.sqon()
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

  /*
  createMenuComponent() {
    const { options, original, intl, display } = this.props;
    const {
      copyable, duplicatable, editable, removable, undoable,
    } = options;
    const { compoundOperators, viewableSqon } = display;
    const menuAdd = intl.formatMessage({ id: 'screen.patientvariant.query.menu.add' });
    const menuRemove = intl.formatMessage({ id: 'screen.patientvariant.query.menu.remove' });
    const menuCopy = intl.formatMessage({ id: 'screen.patientvariant.query.menu.copy' });
    const menuMaximize = intl.formatMessage({ id: 'screen.patientvariant.query.menu.maximize' });
    const menuMinimize = intl.formatMessage({ id: 'screen.patientvariant.query.menu.minimize' });
    const menuDuplicate = intl.formatMessage({ id: 'screen.patientvariant.query.menu.duplicate' });
    const menuRevert = intl.formatMessage({ id: 'screen.patientvariant.query.menu.revert' });
    const menuAdvancedEditor = intl.formatMessage({ id: 'screen.patientvariant.query.menu.advancedEditor' });
    const menuDelete = intl.formatMessage({ id: 'screen.patientvariant.query.menu.delete' });
    const titleMetaIsPresent = this.hasTitle();

    return (
      <Menu onClick={this.handleMenuSelection}>
        {editable && (
        <Menu.Item key={QUERY_ACTION_TITLE}>
          <Icon type={`file${(titleMetaIsPresent ? '' : '-text')}`} />
          {(titleMetaIsPresent ? menuRemove : menuAdd)}
        </Menu.Item>
        )
      }
        {copyable && (
        <Menu.Item key={QUERY_ACTION_COPY}>
          <Icon type="font-size" />
            {menuCopy}
        </Menu.Item>
        )
      }
        <Menu.Item key={QUERY_ACTION_COMPOUND_OPERATORS}>
          <Icon type={`${(compoundOperators ? 'plus' : 'minus')}-circle`} />
          {(compoundOperators ? menuMaximize : menuMinimize)}
        </Menu.Item>
        {duplicatable && (
        <Menu.Item key={QUERY_ACTION_DUPLICATE}>
          <Icon type="file-add" />
            {menuDuplicate}
        </Menu.Item>
        )
      }
        {removable && (
        <Menu.Item key={QUERY_ACTION_DELETE}>
          <Icon type="delete" />
            {menuDelete}
        </Menu.Item>
        )
      }
      </Menu>
    );
  }
  */

  render() {
    const { active, options, original, onSelectCallback, findQueryIndexForKey, findQueryTitle, results, intl, facets, categories, draft, searchData, display, externalData } = this.props;
    const {
      copyable, duplicatable, removable, undoable,
    } = options;

    const hasMenu = copyable || duplicatable || removable || undoable;
    const { compoundOperators } = display;
    const isDirty = !isEqual(original, draft);

    let operatorsHandler = null;
    if (compoundOperators) {
      const operator = find(draft.instructions, {'type': INSTRUCTION_TYPE_OPERATOR});
      if (operator) {
        operatorsHandler = (
          <Operator
            key={operator.key}
            options={options}
            data={operator.data}
            intl={intl}
            onEditCallback={this.handleOperatorChange}
          />
        );
      }
    }

    const classNames = [styleQuery.query];
    if (isDirty) { classNames.push(styleQuery.dirtyQuery) }
    if (active) { classNames.push(styleQuery.activeQuery) } else { classNames.push(styleQuery.inactiveQuery) }
    return (
      <div className={classNames.join(' ')} onClick={this.handleClick}>
        <div className={styleQuery.toolbar}>
          <div className={styleQuery.title}>
            <Input
              size="small"
              defaultValue={draft.title}
              onBlur={this.handleTitleChange}
              onPressEnter={this.handleTitleChange}
              suffix={(copyable && (<IconKit icon={ic_edit} className={styleQuery.iconTitle}/>))}
            />
          </div>

          <div className={styleQuery.actions}>
            {copyable && (<IconKit icon={ic_filter_none} className={styleQuery.icon} onClick={() => { this.handleMenuSelection({ key: QUERY_ACTION_DUPLICATE }) }}/>)}
            {removable && (<IconKit icon={ic_delete} className={styleQuery.icon} onClick={() => { this.handleMenuSelection({ key: QUERY_ACTION_DELETE }) }}/>)}
            </div>
          <div className={styleQuery.count}>
            <span>{results.toLocaleString('en-US').replace(',', ' ')}</span>
          </div>
        </div>
        <div className={styleQuery.instructions}>
          { draft.instructions.map((item, index) => {
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
                    intl={intl}
                    onEditCallback={this.handleOperatorChange}
                    key={index}
                  />
                );
              case INSTRUCTION_TYPE_FILTER:
                let category = null
                let type = null
                categories.map((x, index) => {
                    const value = find(x.filters, ['id', item.data.id]  );
                    if(value){
                        category = x.id
                        type = value.type
                    }
                })

                if(type === FILTER_TYPE_GENERIC){
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
                            key={index}
                          />
                    );
                }else if(type === FILTER_TYPE_NUMERICAL_COMPARISON){
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
                           key={index}
                       />
                    );
                }else if(type === FILTER_TYPE_GENERICBOOL) {

                  const categoryInfo =find(categories, ['id', category]);
                  const categoryData = find(categoryInfo.filters, ['id', item.data.id]);

                  const allOption = []
                  Object.keys(categoryData.search).map((keyName) => {
                      const data = find(searchData, ['id', keyName])
                      if (data && data.data[0]) {
                        const count = data.data[0].count
                        allOption.push({value:keyName , count:count})
                      }
                    }
                  )
                   return (
                       <GenericBooleanFilter
                        index={index}
                        options={options}
                        autoSelect={active}
                        data={item.data}
                        dataSet={allOption ? allOption : []}
                        intl={intl}
                        category={category}
                        onEditCallback={this.handleFilterChange}
                        onRemoveCallback={this.handleFilterRemoval}
                        onSelectCallback={onSelectCallback}
                        key={index}
                      />
                   );
              } else if (type === FILTER_TYPE_COMPOSITE) {
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
                    key={index}
                  />
                );
              } else if (type === FILTER_TYPE_SPECIFIC) {
                  return (
                    <SpecificFilter
                      index={index}
                      options={options}
                      autoSelect={active}
                      data={item.data}
                      dataSet={facets[item.data.id] || []}
                      externalDataSet={externalData}
                      intl={intl}
                      category={category}
                      onEditCallback={this.handleFilterChange}
                      onRemoveCallback={this.handleFilterRemoval}
                      onSelectCallback={onSelectCallback}
                      key={index}
                    />
                  );
              }
              break;

              case INSTRUCTION_TYPE_SUBQUERY:
                const queryIndex = findQueryIndexForKey ? findQueryIndexForKey(item.data.query) : null;
                const queryTitle = findQueryTitle ? findQueryTitle(item.data.query) : null
                return (
                  <Subquery
                    index={index}
                    options={options}
                    data={item.data}
                    intl={intl}
                    queryIndex={queryIndex}
                    queryTitle={queryTitle}
                    onEditCallback={this.handleSubqueryChange}
                    onRemoveCallback={this.handleSubqueryRemoval}
                    onSelectCallback={onSelectCallback}
                    key={index}
                  />
                );
              default:
                return null;
            }
          })}
        </div>
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
  original : [],
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
