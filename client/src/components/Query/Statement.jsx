/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Menu, Button, Checkbox, Tooltip, Badge, Dropdown, Icon, Modal,
} from 'antd';
import {
  cloneDeep, find, findIndex, pull, pullAllBy, filter, isEqual, isEmpty,
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
  'bbeaff', 'ffbe9d', 'f3c0d4', 'c8ffc7', 'fff3b1', 'd3d9e7', 'dcb1b2', 'fcd2d3',
  'c3f3e7', 'ffd694', 'fbe9e9', 'ff9fa2', 'e0c1cd', 'eaceb4', 'b4e6ea',
][index]}`;

class Statement extends React.Component {
  constructor(props) {
    super(props);
    const { data, display, original } = this.props;
    this.versions = [];
    this.state = {
      original: cloneDeep(original),
      checkedQueries: [],
      queriesChecksAreIndeterminate: false,
      queriesAreAllChecked: false,
      display: null,
      visible: false,
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
    this.confirmRemoveChecked = this.confirmRemoveChecked.bind(this);
    this.confirmRemove = this.confirmRemove.bind(this);
    this.getSubquery = this.getSubquery.bind(this);
    this.showDeleteConfirm = this.showDeleteConfirm.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleReorder = this.handleReorder.bind(this);
    this.handleUndo = this.handleUndo.bind(this);
    this.handleCheckQuery = this.handleCheckQuery.bind(this);
    this.handleCheckAllQueries = this.handleCheckAllQueries.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleRemoveChecked = this.handleRemoveChecked.bind(this);
    this.handleNewQuery = this.handleNewQuery.bind(this);
    this.handleCombine = this.handleCombine.bind(this);
    this.findQueryIndexForKey = this.findQueryIndexForKey.bind(this);
    this.commit = this.commit.bind(this);

    const displays = [];
    data.map((newDatum) => {
      displays.push({ ...display });
      if (!newDatum.key) {
        newDatum.key = uuidv1();
      }
      return newDatum;
    });

    this.state.display = cloneDeep(displays);
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
    this.props.onSelectCallback(query.data);
  }

  handleEdit(query) {
    if (this.isEditable()) {
      const { onEditCallback, data } = this.props;
      this.commit(data);
      if (onEditCallback) {
        onEditCallback(query);
      }
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
      const { onDuplicateCallback, data } = this.props;
      const { display } = this.state;

      this.commit(data);
      const index = query.index + 1;
      const clone = cloneDeep(query);
      clone.data.key = uuidv1();

      const displayClone = cloneDeep(display);
      const howDisplayed = this.state.display[query.index];
      displayClone.splice(index, 0, howDisplayed);

      this.setState({
        display: displayClone,
      }, () => {
        onDuplicateCallback(clone, index);
      });
    }
  }

  handleRemove(query) {
    if (this.isRemovable()) {
      this.commit(this.props.data);
      const hasSubQuery = find(query.data.instructions, ['type', 'subquery']);
      if (hasSubQuery) {
        this.showDeleteConfirm(query.data.key, query);
      } else {
        this.confirmRemove(query.data.key);
      }
    }
  }

  confirmRemove(key) {
    const { onRemoveCallback, data } = this.props;
    this.commit(data);
    onRemoveCallback(key);
  }

  handleReorder(sorted) {
    if (this.isReorderable() && !isEmpty(sorted)) {
      const { display } = this.state;
      const { onSortCallback, data } = this.props;
      this.commit(data);
      const sortedIndices = sorted.map(clip => clip.index);
      const sortedData = sortedIndices.map(sortedIndice => data[sortedIndice]);
      const sortedDisplay = sortedIndices.map(sortedIndice => display[sortedIndice]);
      this.setState({
        display: sortedDisplay,
      }, () => {
        onSortCallback(sortedData)
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
      const { onBatchEditCallback } = this.props;
      const last = this.versions.pop();
      if (last) {
        onBatchEditCallback(cloneDeep(last));
      }
    }
  }

  commit(version) {
    const lastVersion = this.versions[this.versions.length - 1];
    if (isEqual(lastVersion, version)) return;
    this.versions.push(cloneDeep(version));
    const revisions = this.versions.length;
    if (revisions > MAX_REVISIONS) {
      this.versions.splice(0, MAX_REVISIONS);
    }
  }

  handleCheckQuery(e) {
    const { data } = this.props;
    const { checkedQueries } = this.state;
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
    const queriesCount = data.length;
    const checkedQueriesCount = checkedQueries.length;
    const queriesAreAllChecked = (queriesCount === checkedQueriesCount);
    this.setState({
      checkedQueries,
      queriesAreAllChecked,
      queriesChecksAreIndeterminate: (!queriesAreAllChecked && checkedQueriesCount > 0),
    });
  }

  handleCombine({ key }) {
    const { data } = this.props;
    const { checkedQueries, display } = this.state;
    const defaultDisplay = cloneDeep(this.props.display);
    display.push(defaultDisplay);

    if (checkedQueries.length > 1) {
      const { onBatchEditCallback } = this.props;
      const sortedCheckedQueries = cloneDeep(checkedQueries);
      sortedCheckedQueries.sort((a, b) => this.findQueryIndexForKey(a) - this.findQueryIndexForKey(b));
      const instructions = sortedCheckedQueries.reduce((accumulator, query) => {
        const subquery = createSubquery(key, query);
        const operator = createOperator(key);
        return [...accumulator, subquery, operator];
      }, []);

      instructions.pop();
      const newSubquery = {
        key: uuidv1(),
        instructions,
      };
      const newDraft = [
        ...data,
        newSubquery
      ]
      this.setState({
        checkedQueries: [],
        display,
      }, () => {
        onBatchEditCallback(newDraft);
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
      const { data } = this.props;
      const checkedQueries = data.reduce((accumulator, query) => [...accumulator, query.key], []);
      this.setState({
        checkedQueries,
        queriesChecksAreIndeterminate: false,
        queriesAreAllChecked: true,
      });
    }
  }

  getSubquery() {
    const { data } = this.props;
    const { checkedQueries } = this.state;

    const subquery = [];
    for (const d of data) {
      if (d.instructions) {
        d.instructions.map((i) => {
          if (i.type === INSTRUCTION_TYPE_SUBQUERY) {
            if (checkedQueries.indexOf(i.data.query) != -1) {
              return subquery.push(d);
            }
          }
        });
      }
    }
    return subquery;
  }

  handleRemoveChecked() {
    if (this.isRemovable()) {
      const keys = [];
      const subquery = this.getSubquery();
      subquery.map(s => keys.push({ key: s.key }));

      keys.length != 0 ? this.showDeleteConfirm(keys) : this.confirmRemoveChecked();
    }
  }


  showDeleteConfirm(delSubQuery, query = null) {
    const { confirm } = Modal;
    const { intl } = this.props;
    const modalTitle = intl.formatMessage({ id: 'screen.patientvariant.statement.modal.title' });
    const modalContent = intl.formatMessage({ id: 'screen.patientvariant.statement.modal.content' });
    const modalOk = intl.formatMessage({ id: 'screen.patientvariant.statement.modal.ok' });
    const modalCancel = intl.formatMessage({ id: 'screen.patientvariant.statement.modal.cancel' });
    const that = this;
    confirm({
      title: modalTitle,
      content: modalContent,
      okText: modalOk,
      okType: 'danger',
      cancelText: modalCancel,

      onOk() {
        Array.isArray(delSubQuery) ? that.confirmRemoveChecked(delSubQuery) : that.confirmRemove(delSubQuery);
      },
    });
  }

  confirmRemoveChecked(delSubQuery = []) {
    const { checkedQueries } = this.state;
    const { onRemoveCallback, data } = this.props;

    this.commit(data);

    const keysToRemove = checkedQueries.reduce((accumulator, key) => [...accumulator, { key }], []);
    keysToRemove.push(...delSubQuery);

    pullAllBy(newDraft, keysToRemove, 'key');

    this.setState({
      checkedQueries: [],
      queriesChecksAreIndeterminate: false,
      queriesAreAllChecked: false,
    }, () => {
      keysToRemove.forEach((query) => {
        onRemoveCallback(query.key);
      })
    } );
  }

  handleNewQuery() {
    const { onEditCallback, data } = this.props;
    const { display } = this.state;
    if (isEmpty(data)) {
      this.commit(data);
    }
    const newQuery = {
      key: uuidv1(),
      instructions: []
    };
    const newDisplay = cloneDeep(this.props.display);
    display.push(newDisplay);
    this.setState({
      display,
    }, () => {
      onEditCallback(newQuery)
    });
  }

  findQueryIndexForKey(key) {
    const { data } = this.props;
    return findIndex(data, { key });
  }

  render() {
    const { activeQuery, data, options, intl, facets, matches ,categories } = this.props;
    if (!data) return null;
    const { display, original, checkedQueries, queriesChecksAreIndeterminate, queriesAreAllChecked } = this.state;
    const {
      editable, reorderable, removable, undoable,
    } = options;
    const checkedQueriesCount = checkedQueries.length;
    const combineText = intl.formatMessage({ id: 'screen.patientvariant.statement.combine' });
    const deleteText = intl.formatMessage({ id: 'screen.patientvariant.statement.delete' });
    const newQueryText = intl.formatMessage({ id: 'screen.patientvariant.statement.newQuery' });
    const combineAnd = intl.formatMessage({ id: 'screen.patientvariant.statement.and' });
    const combineOr = intl.formatMessage({ id: 'screen.patientvariant.statement.or' });
    const combineAndNot = intl.formatMessage({ id: 'screen.patientvariant.statement.andnot' });
    const checkToolTip = intl.formatMessage({ id: 'screen.patientvariant.statement.tooltip.check' });
    const unCheckToolTip = intl.formatMessage({ id: 'screen.patientvariant.statement.tooltip.uncheck' });
    const allText = intl.formatMessage({ id: 'screen.patientvariant.statement.tooltip.all' });
    const combineSelectionToolTip = intl.formatMessage({ id: 'screen.patientvariant.statement.tooltip.combineSelection' });
    const deleteSelectionToolTip = intl.formatMessage({ id: 'screen.patientvariant.statement.tooltip.deleteSelection' });
    const undoToolTip = intl.formatMessage({ id: 'screen.patientvariant.statement.tooltip.undo' });
    const queries = data.reduce((accumulator, query, index) => {
      const isChecked = checkedQueries.indexOf(query.key) !== -1;
      const isActive = activeQuery === query.key;
      const initial = find(original, { key: query.key }) || null;
      const subqueries = isActive ? filter(query.instructions, { type: INSTRUCTION_TYPE_SUBQUERY }) : [];
      const highlightedQueries = subqueries.reduce((accumulator, subquery) => [...accumulator, subquery.data.query], []);

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
            key={query.key}
            original={initial}
            draft={query}
            display={display[index]}
            options={options}
            index={index}
            active={isActive}
            results={(matches[query.key] ? matches[query.key] : 0)}
            intl={intl}
            facets={(facets[query.key] ? facets[query.key] : {})}
            categories= {categories}
            onCopyCallback={this.handleCopy}
            onEditCallback={this.handleEdit}
            onDisplayCallback={this.handleDisplay}
            onDuplicateCallback={this.handleDuplicate}
            onRemoveCallback={this.handleRemove}
            onSelectCallback={this.handleSelect}
            onUndoCallback={this.handleUndo}
            onClickCallback={this.handleClick}
            findQueryIndexForKey={this.findQueryIndexForKey}
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
                trigger={['click']}
                overlay={(
                  <Menu onClick={this.handleCombine}>
                    <Menu.Item key={SUBQUERY_TYPE_INTERSECT}>
                      <IconKit size={24} icon={software_pathfinder_intersect} />
                      {combineAnd}
                    </Menu.Item>
                    <Menu.Item key={SUBQUERY_TYPE_SUBTRACT}>
                      <IconKit size={24} icon={software_pathfinder_subtract} />
                      {combineAndNot}
                    </Menu.Item>
                    <Menu.Item key={SUBQUERY_TYPE_UNITE}>
                      <IconKit size={24} icon={software_pathfinder_unite} />
                      {combineOr}
                    </Menu.Item>
                  </Menu>
                  )}
              >
                <Button icon="block">
                  {combineText}
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
            <Tooltip title={newQueryText}>
              <Button type="primary" onClick={this.handleNewQuery}>{newQueryText}</Button>
            </Tooltip>
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
      </div>
    );
  }
}

Statement.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  data: PropTypes.array.isRequired,
  display: PropTypes.shape({}),
  options: PropTypes.shape({}),
  onSelectCallback: PropTypes.func,
  onEditCallback: PropTypes.func,
  onSortCallback: PropTypes.func,
  onRemoveCallback: PropTypes.func,
  onDuplicateCallback: PropTypes.func,
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
  onSelectCallback: () => {},
  onEditCallback: () => {},
  onBatchEditCallback: () => {},
  onSortCallback: () => {},
  onRemoveCallback: () => {},
  onDuplicateCallback: () => {},
};

export default Statement;
