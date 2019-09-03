/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Menu, Button, Checkbox,  Tooltip, Badge, Dropdown, Icon,
} from 'antd';
import {
  cloneDeep, find, findIndex, pull, pullAllBy, filter,
} from 'lodash';
import uuidv1 from 'uuid/v1';
import DragSortableList from 'react-drag-sortable';
import IconKit from 'react-icons-kit';
import {
  software_pathfinder_intersect, software_pathfinder_unite, software_pathfinder_subtract,
} from 'react-icons-kit/linea';

import Query, { DEFAULT_EMPTY_QUERY } from './index';
import {
  INSTRUCTION_TYPE_SUBQUERY, SUBQUERY_TYPE_INTERSECT, SUBQUERY_TYPE_UNITE, SUBQUERY_TYPE_SUBTRACT, createSubquery,
} from './Subquery';
import { createOperator } from './Operator';

const MAX_QUERIES = 15;
const MAX_REVISIONS = 10;
const DEFAULT_INSTRUCTIONS = {
  instructions: DEFAULT_EMPTY_QUERY,
};

export const convertIndexToLetter = index => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(index);

export const convertIndexToColor = index => `#${[
  '21ABCD', 'FF8C00', 'D4236E', '20D32F', 'FFF000', 'FF756B', 'C67D57', 'F4C2C2',
  '88D8C1', 'FFBF00', 'EE959E', 'FF1818', 'CD5E77', 'A25A3D', 'DEA77F',
][index]}`;

class Statement extends React.Component {
  constructor(props) {
    super(props);
    this.versions = [];
    this.state = {
      draft: null,
      original: null,
      checkedQueries: [],
      activeQuery: null,
      queriesChecksAreIndeterminate: false,
      queriesAreAllChecked: false,
      display: null,
      options: {
        copyable: null,
        duplicatable: null,
        editable: null,
        removable: null,
        reorderable: null,
        selectable: null,
        undoable: null,
      },
    };
    this.isCopyable = this.isCopyable.bind(this);
    this.isEditable = this.isEditable.bind(this);
    this.isDuplicatable = this.isDuplicatable.bind(this);
    this.isRemovable = this.isRemovable.bind(this);
    this.isReorderable = this.isReorderable.bind(this);
    this.isSelectable = this.isSelectable.bind(this);
    this.isUndoable = this.isUndoable.bind(this);
    this.handleCopy = this.handleCopy.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleDisplay = this.handleDisplay.bind(this);
    this.handleDuplicate = this.handleDuplicate.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleReorder = this.handleReorder.bind(this);
    this.handleUndo = this.handleUndo.bind(this);
    this.handleCheckQuery = this.handleCheckQuery.bind(this);
    this.handleCheckAllQueries = this.handleCheckAllQueries.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.createMenuComponent = this.createMenuComponent.bind(this);
    this.handleRemoveChecked = this.handleRemoveChecked.bind(this);
    this.handleCombine = this.handleCombine.bind(this);
    this.findQueryIndexForKey = this.findQueryIndexForKey.bind(this);
    this.commit = this.commit.bind(this);
    // this.handleMenuSelection = this.handleMenuSelection.bind(this);

    // @NOTE Initialize Component State
    const { data, display } = props;
    const displays = [];
    data.map((newDatum) => {
      displays.push({ ...display });
      newDatum.key = uuidv1();
      return newDatum;
    });
    this.state.original = data;
    this.state.draft = cloneDeep(data);
    this.state.display = cloneDeep(displays);
    this.state.activeQuery = (data.length - 1) || null;
  }

  isCopyable() {
    const { options } = this.props;
    const { copyable } = options;
    return copyable === true;
  }

  isDuplicatable() {
    const { options } = this.props;
    const { duplicatable } = options;
    return duplicatable === true;
  }

  isEditable() {
    const { options } = this.props;
    const { editable } = options;
    return editable === true;
  }

  isRemovable() {
    const { options } = this.props;
    const { removable } = options;
    return removable === true;
  }

  isReorderable() {
    const { options } = this.props;
    const { reorderable } = options;
    return reorderable === true;
  }

  isSelectable() {
    const { options } = this.props;
    const { selectable } = options;
    return selectable === true;
  }

  isUndoable() {
    const { options } = this.props;
    const { undoable } = options;
    return undoable === true;
  }

  handleCopy() {
    if (this.isCopyable()) {
      return true;
    }
  }

  handleClick(query) {
    const { activeQuery } = this.state;
    const { index } = query;
    if (activeQuery !== index) {
      this.setState({
        activeQuery: index,
      });
    }
  }

  handleEdit(query) {
    if (this.isEditable()) {
      const { draft } = this.state;
      this.commit(draft);
      draft[query.index] = query.data;
      this.setState({
        draft,
      });
    }
  }

  handleDisplay(config) {
    const { display } = this.state;
    display[config.index] = config.display;
    this.setState({
      display,
    });
  }

  handleDuplicate(query) {
    if (this.isDuplicatable()) {
      const { draft } = this.state;
      this.commit(draft);
      const index = query.index + 1;
      const clone = cloneDeep(query);
      clone.data.key = uuidv1();
      draft.splice(index, 0, clone.data);
      this.setState({
        draft,
      });
    }
  }

  handleRemove(query) {
    if (this.isRemovable()) {
      const { draft } = this.state;
      this.commit(draft);
      pullAllBy(draft, [{ key: query.data.key }], 'key');
      this.setState({
        draft,
      });
    }
  }

  handleReorder(sorted) {
    if (this.isReorderable()) {
      const { activeQuery, draft, display } = this.state;
      this.commit(draft);
      const sortedIndices = sorted.map(clip => clip.index);
      const sortedData = sortedIndices.map(sortedIndice => draft[sortedIndice]);
      const sortedDisplay = sortedIndices.map(sortedIndice => display[sortedIndice]);
      const newActiveQuery = findIndex(sortedData, { key: draft[activeQuery].key })
      this.setState({
        activeQuery: newActiveQuery,
        display: sortedDisplay,
        draft: sortedData,
      });
    }
  }

  handleSelect(item) {
    if (this.isSelectable()) {
      return true;
    }
  }

  handleUndo() {
    if (this.isUndoable()) {
      const last = this.versions.pop();
      if (last) {
        this.setState({
          draft: cloneDeep(last),
        });
      }
    }
  }

  commit(version) {
    this.versions.push(cloneDeep(version));
    const revisions = this.versions.length;
    if (revisions > MAX_REVISIONS) {
      this.versions.splice(0, MAX_REVISIONS);
    }
  }

  handleCheckQuery(e) {
    const { checkedQueries, draft } = this.state;
    const { target } = e;
    const { value, checked } = target;
    if (!checked) {
      pull(checkedQueries, value);
    } else {
      if (checkedQueries.indexOf(value) !== -1) {
        return;
      }
      checkedQueries.push(value);
    }
    const queriesCount = draft.length;
    const checkedQueriesCount = checkedQueries.length;
    const queriesAreAllChecked = (queriesCount === checkedQueriesCount);
    this.setState({
      checkedQueries,
      queriesAreAllChecked,
      queriesChecksAreIndeterminate: (!queriesAreAllChecked && checkedQueriesCount > 0),
    });
  }

  handleCombine({ key }) {
    const { checkedQueries, draft } = this.state;
    if (checkedQueries.length > 1) {
      const sortedCheckedQueries = cloneDeep(checkedQueries);
      sortedCheckedQueries.sort((a, b) => this.findQueryIndexForKey(a) - this.findQueryIndexForKey(b));
      const instructions = sortedCheckedQueries.reduce((accumulator, query) => {
        const subquery = createSubquery(key, query);
        const operator = createOperator(key);
        return [...accumulator, subquery, operator];
      }, []);

      instructions.pop();
      draft.push({
        key: uuidv1(),
        instructions,
      });
      this.setState({
        draft,
      });
    }
  }

  handleCheckAllQueries(e) {
    const { target } = e;
    const { checked } = target;
    if (!checked) {
      this.setState({
        checkedQueries: [],
        queriesChecksAreIndeterminate: false,
        queriesAreAllChecked: false,
      });
    } else {
      const { draft } = this.state;
      const checkedQueries = draft.reduce((accumulator, query) => [...accumulator, query.key], []);
      this.setState({
        checkedQueries,
        queriesChecksAreIndeterminate: false,
        queriesAreAllChecked: true,
      });
    }
  }

  handleRemoveChecked() {
    if (this.isRemovable()) {
      const { checkedQueries, draft } = this.state;
      this.commit(draft);
      const keysToRemove = checkedQueries.reduce((accumulator, key) => [...accumulator, { key }], []);
      pullAllBy(draft, keysToRemove, 'key');
      this.setState({
        draft,
        checkedQueries: [],
        queriesChecksAreIndeterminate: false,
        queriesAreAllChecked: false,
      });
    }
  }

  findQueryIndexForKey(key) {
    const { draft } = this.state;
    return findIndex(draft, { key });
  }

  /*
  handleMenuSelection({ key }) {
    switch (key) {
      case STATEMENT_ACTION_UNDO:
        this.setState({
          data: [...this.props.data],
        });
        break;
      default:
        break;
    }
  }
  */

  createMenuComponent() {
    return (
      <Menu onClick={this.handleMenuSelection}>
        <Menu.Item key="A">A</Menu.Item>
      </Menu>
    );
  }

  render() {
    const {
      display, draft, original, checkedQueries, queriesChecksAreIndeterminate, queriesAreAllChecked, activeQuery,
    } = this.state;
    if (draft === null) { return null }
    const { options, intl } = this.props;
    const {
      editable, reorderable, removable, undoable,
    } = options;
    const checkedQueriesCount = checkedQueries.length;

    const query = cloneDeep(draft[activeQuery]);
    const subqueries = query ? filter(query.instructions, { type: INSTRUCTION_TYPE_SUBQUERY }) : [];
    const highlightedQueries = subqueries.reduce((accumulator, subquery) => [...accumulator, subquery.data.query], []);

    const combineText = intl.formatMessage({ id: 'screen.patientVariant.statement.combine' });
    const deleteText = intl.formatMessage({ id: 'screen.patientVariant.statement.delete' });
    const combineAnd = intl.formatMessage({ id: 'screen.patientVariant.statement.and' });
    const combineOr = intl.formatMessage({ id: 'screen.patientVariant.statement.or' });
    const combineAndNot = intl.formatMessage({ id: 'screen.patientVariant.statement.andnot' });
    const checkToolTip = intl.formatMessage({ id: 'screen.patientVariant.statement.tooltip.check' });
    const unCheckToolTip = intl.formatMessage({ id: 'screen.patientVariant.statement.tooltip.uncheck' });
    const allText = intl.formatMessage({ id: 'screen.patientVariant.statement.tooltip.all' });
    const combineSelectionToolTip = intl.formatMessage({ id: 'screen.patientVariant.statement.tooltip.combineSelection' });
    const deleteSelectionToolTip = intl.formatMessage({ id: 'screen.patientVariant.statement.tooltip.deleteSelection' });
    const undoToolTip = intl.formatMessage({ id: 'screen.patientVariant.statement.tooltip.undo' });

    const queries = draft.reduce((accumulator, query, index) => {
      const isChecked = checkedQueries.indexOf(query.key) !== -1;
      const isActive = activeQuery === index;
      const initial = find(original, { key: query.key }) || null;
      return [...accumulator, (
        <div className={`query-container${(isChecked ? ' selected' : '')}${(isActive ? ' active' : '')}`}>
          <div
            className="selector"
            style={{
              backgroundColor:
                (highlightedQueries.indexOf(query.key) !== -1 ? convertIndexToColor(this.findQueryIndexForKey(query.key)) : ''),
              }}
          >
            <Checkbox
              key={`selector-${query.key}`}
              value={query.key}
              checked={isChecked}
              onChange={this.handleCheckQuery}
            />
            <div className="index">{convertIndexToLetter(index)}</div>
          </div>
          <Query
            draft={query}
            original={initial}
            display={display[index]}
            index={index}
            active={isActive}
            key={query.key}
            results={1000}
            intl={intl}
            onCopyCallback={this.handleCopy}
            onEditCallback={this.handleEdit}
            onDisplayCallback={this.handleDisplay}
            onDuplicateCallback={this.handleDuplicate}
            onRemoveCallback={this.handleRemove}
            onSelectCallback={this.handleSelect}
            onUndoCallback={this.handleUndo}
            onClickCallback={this.handleClick}
            findQueryIndexForKey={this.findQueryIndexForKey}
            options={options}
          />
        </div>
      )];
    }, []);
    return (
      <div className="statement">
        <div className="action-container">
          <Tooltip title={`${!queriesAreAllChecked ? checkToolTip : unCheckToolTip} ${allText}`}>
            <Checkbox
              key="check-all"
              className="selector"
              indeterminate={queriesChecksAreIndeterminate}
              onChange={this.handleCheckAllQueries}
              checked={queriesAreAllChecked}
            />
          </Tooltip>
          <div className="actions left">
            { editable && (
            <Tooltip title={combineSelectionToolTip}>
              <Dropdown
                disabled={(checkedQueriesCount < 2)}
                trigger = {['click']}
                overlay={(
                  <Menu onClick={this.handleCombine}>
                    <Menu.Item key={SUBQUERY_TYPE_INTERSECT}>
                      <IconKit size={24} icon={software_pathfinder_intersect} />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{combineAnd}
                    </Menu.Item>
                    <Menu.Item key={SUBQUERY_TYPE_SUBTRACT}>
                      <IconKit size={24} icon={software_pathfinder_subtract} />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{combineAndNot}
                    </Menu.Item>
                    <Menu.Item key={SUBQUERY_TYPE_UNITE}>
                      <IconKit size={24} icon={software_pathfinder_unite} />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{combineOr}
                    </Menu.Item>
                  </Menu>
                  )}
              >
                <Button icon="block">
                      {combineTexte}
                  {' '}
                  <Icon type="caret-down" />
                </Button>
              </Dropdown>
            </Tooltip>
            ) }
            { removable && (
            <Tooltip title={deleteSelectionToolTip}>
              <Button icon="delete" type="danger" disabled={(checkedQueriesCount < 1)} onClick={this.handleRemoveChecked}>{deleteText}</Button>
            </Tooltip>
            ) }
          </div>
          <div className="actions right">
            { undoable && (
            <Tooltip title={undoToolTip}>
              <Badge count={this.versions.length}>
                <Button icon="undo" shape="circle" disabled={(this.versions.length < 1)} onClick={this.handleUndo} />
              </Badge>
            </Tooltip>
            ) }
          </div>
        </div>
        {reorderable
          ? (
            <DragSortableList
              key="sortable"
              type="vertical"
              items={queries.map((query, index) => ({ content: query, index }))}
              onSort={this.handleReorder}
            />
          ) : queries
        }
        { editable && queries.length < MAX_QUERIES && (
        <div className={`query-container${((!draft.length || activeQuery === draft.length) ? ' active' : '')}`}>
          <div className="selector" />
          <Query
            draft={cloneDeep(DEFAULT_INSTRUCTIONS)}
            original={null}
            display={cloneDeep(display[queries.length])}
            key={uuidv1()}
            index={queries.length}
            active={false}
            intl={intl}
            options={{
              copyable: true,
              duplicatable: false,
              editable: true,
              removable: false,
              reorderable: false,
              selectable: false,
              undoable: false,
            }}
            onEditCallback={this.handleEdit}
            onClickCallback={this.handleClick}
          />
        </div>
        ) }
      </div>
    );
  }
}

Statement.propTypes = {
  data: PropTypes.shape([]).isRequired,
  display: PropTypes.shape({}),
  options: PropTypes.shape({}),
};

Statement.defaultProps = {
  display: {
    compoundOperators: true,
    viewableSqon: false,
  },
  options: {
    copyable: true,
    duplicatable: true,
    editable: true,
    removable: true,
    reorderable: true,
    selectable: true,
    undoable: true,
  },
};

export default Statement;
