/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  cloneDeep, isEqual, find, isNull,
} from 'lodash';
import {
  Input, Tooltip, Popconfirm,
} from 'antd';
import uuidv1 from 'uuid/v1';
import copy from 'copy-to-clipboard';

import IconKit from 'react-icons-kit';
import {
  ic_edit, ic_delete, ic_filter_none,
} from 'react-icons-kit/md';
import {
  INSTRUCTION_TYPE_FILTER,
  FILTER_TYPE_GENERIC,
  FILTER_TYPE_NUMERICAL_COMPARISON,
  FILTER_TYPE_GENERICBOOL,
  FILTER_TYPE_COMPOSITE,
  FILTER_TYPE_SPECIFIC,
} from './Filter/index';
import GenericFilter from './Filter/Generic';
import SpecificFilter from './Filter/Specific';
import NumericalComparisonFilter from './Filter/NumericalComparison';
import CompositeFilter from './Filter/Composite';
import GenericBooleanFilter from './Filter/GenericBoolean';
import Operator, {
  INSTRUCTION_TYPE_OPERATOR,
  OPERATOR_TYPE_AND_NOT,
} from './Operator';
import Subquery, { INSTRUCTION_TYPE_SUBQUERY } from './Subquery';
import { sanitizeInstructions, calculateTitleWidth } from './helpers/query';
import styleQuery from './styles/query.module.scss';


const QUERY_ACTION_COPY = 'copy';
const QUERY_ACTION_UNDO_ALL = 'undo-all';
const QUERY_ACTION_DELETE = 'delete';
const QUERY_ACTION_DUPLICATE = 'duplicate';
const QUERY_ACTION_COMPOUND_OPERATORS = 'compound-operators';
const QUERY_ACTION_TITLE = 'title';

class Query extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      onFocus: false,
      popconfirmOpen: false,
      toolTipOpen: false,
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
    this.handleTitleOnFocus = this.handleTitleOnFocus.bind(this);
    this.handleTitleFocus = this.handleTitleFocus.bind(this);
    this.handleTitleOnChange = this.handleTitleOnChange.bind(this);
    this.toggleToolTip = this.toggleToolTip.bind(this);
    this.togglePopConfirm = this.togglePopConfirm.bind(this);
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

  handleTitleOnFocus(e) {
    e.target.select();
    this.setState({ onFocus: true });
  }

  handleTitleOnChange(e) {
    const { value } = e.target;
    const width = calculateTitleWidth(value);

    e.target.style.width = `calc(15px + ${width}ch)`;
  }

  // @TODO Refactor by using state to define the 'autofocus' attribute on the DOM element
  handleTitleFocus() {
    const { draft } = this.props;
    const input = document.querySelector(`.title-${draft.key}`);
    input.focus();
  }

  addInstruction(instruction) {
    // @NOTE Cannot add new filters to a query using an exclusion operator; not implemented yet.
    const { draft } = this.props;
    const andNotOperator = find(draft.instructions, dInstruction => (dInstruction.type === INSTRUCTION_TYPE_OPERATOR && instruction.data.type === OPERATOR_TYPE_AND_NOT));
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

  json() {
    const { draft } = this.props;
    const sqon = this.sqon();
    return { ...draft, instructions: sqon };
  }

  sqon() {
    const { draft } = this.props;
    const sqon = draft.instructions.map((datum) => {
      const newDatum = cloneDeep(datum);
      delete newDatum.key;
      delete newDatum.display;
      delete newDatum.data.index;
      return newDatum;
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

  toggleToolTip() {
    const { toolTipOpen, popconfirmOpen } = this.state;
    if (popconfirmOpen) {
      this.setState({ toolTipOpen: false });
    } else {
      this.setState({ toolTipOpen: !toolTipOpen });
    }
  }

  togglePopConfirm() {
    const { popconfirmOpen, toolTipOpen } = this.state;
    this.setState({
      popconfirmOpen: !popconfirmOpen,
      toolTipOpen: false,
    });
  }

  render() {
    const {
      active, options, original, onSelectCallback, findQueryIndexForKey, findQueryTitle, results, intl, facets, categories, draft, externalData,
    } = this.props;
    const {
      copyable, removable,
    } = options;
    const { onFocus, popconfirmOpen, toolTipOpen } = this.state;
    const isDirty = !isEqual(original, draft);
    const isEmpty = !draft.instructions || draft.instructions.length === 0;

    const duplicateText = intl.formatMessage({ id: 'screen.patientvariant.query.menu.duplicate' });
    const deleteText = intl.formatMessage({ id: 'screen.patientvariant.query.menu.delete' });
    const editTitleText = intl.formatMessage({ id: 'screen.patientvariant.query.menu.editTitle' });
    const width = draft.title ? calculateTitleWidth(draft.title) : 0;
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
                // onFocus={this.handleTitleOnFocus}
                onPressEnter={this.handleTitleChange}
                onChange={this.handleTitleOnChange}
                className={`title-${draft.key}`}
                style={{ width: `calc(14px + ${width}ch)` }}
              />
              <IconKit
                icon={ic_edit}
                size={14}
                className={`${styleQuery.iconTitle} ${styleQuery.icon} ${onFocus ? `${styleQuery.focusIcon}` : null}`}
                onClick={this.handleTitleFocus}
              />
            </div>
          </Tooltip>
          <div className={styleQuery.actions}>
            {copyable && !isEmpty && (
            <Tooltip title={duplicateText}>
              <IconKit icon={ic_filter_none} size={16} className={styleQuery.icon} onClick={() => { this.handleMenuSelection({ key: QUERY_ACTION_DUPLICATE }); }} />
            </Tooltip>
            )}
            {removable && (
            <Tooltip title={deleteText} onVisibleChange={this.toggleToolTip} visible={toolTipOpen}>
              <Popconfirm
                title="Supprimer définitivement cette requête."
                onConfirm={() => { this.handleMenuSelection({ key: QUERY_ACTION_DELETE }); }}
                okText="Supprimer"
                cancelText="Annuler"
                icon={null}
                overlayClassName={styleQuery.popconfirm}
                onVisibleChange={this.togglePopConfirm}
              >
                <IconKit icon={ic_delete} size={16} className={styleQuery.icon} />

              </Popconfirm>
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
  index: PropTypes.number,
  results: PropTypes.number,
  externalData: PropTypes.shape({}),
  onClickCallback: PropTypes.func,
  onCopyCallback: PropTypes.func,
  onDisplayCallback: PropTypes.func,
  onEditCallback: PropTypes.func,
  onDuplicateCallback: PropTypes.func,
  onRemoveCallback: PropTypes.func,
  onSelectCallback: PropTypes.func,
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
  index: 0,
  results: null,
  externalData: {},
  onClickCallback: () => {},
  onCopyCallback: () => {},
  onDisplayCallback: () => {},
  onEditCallback: () => {},
  onDuplicateCallback: () => {},
  onRemoveCallback: () => {},
  onSelectCallback: () => {},
  findQueryIndexForKey: null,
};

export default Query;
