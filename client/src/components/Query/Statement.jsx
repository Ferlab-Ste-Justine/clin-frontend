/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Menu, Button, Checkbox, Divider, Tooltip,
} from 'antd';
import {
  cloneDeep, find, pull, pullAllBy,
} from 'lodash';
import uuidv1 from 'uuid/v1';
import DragSortableList from 'react-drag-sortable';

import Query, { DEFAULT_EMPTY_QUERY } from './index';


const MAX_REVISIONS = 10;
const DEFAULT_INSTRUCTIONS = {
  instructions: DEFAULT_EMPTY_QUERY,
};

class Statement extends React.Component {
  constructor() {
    super();
    this.versions = null;
    this.state = {
      draft: null,
      original: null,
      checkedQueries: null,
      queriesChecksAreIndeterminate: null,
      queriesAreAllChecked: null,
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
    this.createMenuComponent = this.createMenuComponent.bind(this);
    this.handleRemoveChecked = this.handleRemoveChecked.bind(this);
    this.commit = this.commit.bind(this);
    // this.handleMenuSelection = this.handleMenuSelection.bind(this);
  }

  componentWillMount() {
    this.versions = [];
    const { data, display } = this.props;
    const displays = [];
    data.map((newDatum) => {
      displays.push({ ...display });
      newDatum.key = uuidv1();
      return newDatum;
    });
    this.setState({
      original: data,
      draft: cloneDeep(data),
      display: cloneDeep(displays),
      checkedQueries: [],
      queriesChecksAreIndeterminate: false,
      queriesAreAllChecked: false,
    });
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
      const { draft, display } = this.state;
      this.commit(draft);
      const sortedIndices = sorted.map(clip => clip.index);
      const sortedData = sortedIndices.map(sortedIndice => draft[sortedIndice]);
      const sortedDisplay = sortedIndices.map(sortedIndice => display[sortedIndice]);
      this.setState({
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
      const last = this.versions.pop()
      if (last) {
        this.setState({
          draft: last,
        })
      }
    }
  }

  commit(version) {
    this.versions.push(cloneDeep(version))
    this.versions.splice(0, (this.versions - MAX_REVISIONS));
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
      display, draft, original, checkedQueries, queriesChecksAreIndeterminate, queriesAreAllChecked,
    } = this.state;
    const { options } = this.props;
    const { reorderable, removable, undoable } = options;
    const checkedQueriesCount = checkedQueries.length;
    const queries = draft.reduce((accumulator, query, index) => {
      const isChecked = checkedQueries.indexOf(query.key) !== -1;
      const initial = find(original, { key: query.key }) || null;
      return [...accumulator, (
        <div className={`query-container${(isChecked ? ' selected' : '')}`}>
          <div className="selector">
            <Checkbox
              key={`selector-${query.key}`}
              value={query.key}
              checked={isChecked}
              onChange={this.handleCheckQuery}
            />
          </div>
          <Query
            draft={query}
            original={initial}
            display={display[index]}
            index={index}
            key={query.key}
            onCopyCallback={this.handleCopy}
            onEditCallback={this.handleEdit}
            onDisplayCallback={this.handleDisplay}
            onDuplicateCallback={this.handleDuplicate}
            onRemoveCallback={this.handleRemove}
            onSelectCallback={this.handleSelect}
            onUndoCallback={this.handleUndo}
            options={options}
          />
        </div>
      )];
    }, []);
    return (
      <div className="statement">
        <div className="action-container">
          <Tooltip title={`${!queriesAreAllChecked ? 'Check' : 'Uncheck'} All`}>
            <Checkbox
              key="check-all"
              className="selector"
              indeterminate={queriesChecksAreIndeterminate}
              onChange={this.handleCheckAllQueries}
              checked={queriesAreAllChecked}
            />
          </Tooltip>
          <span className="actions">
            { removable && (
                <Tooltip title="Delete Checked Queries">
                  <Button icon="delete" type="danger" size="small" disabled={(checkedQueriesCount < 1)} onClick={this.handleRemoveChecked}>Delete</Button>
                </Tooltip>
            ) }
            { undoable && (
                <Tooltip title="Undo Last Modification">
                  <Button icon="undo" size="small" shape="circle" disabled={(this.versions.length < 1)} onClick={this.handleUndo}/>
                </Tooltip>
            ) }
          </span>
        </div>
        <Divider />
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
        <div className="query-container">
          <div className="selector">
            <Checkbox disabled />
          </div>
          <Query
            draft={cloneDeep(DEFAULT_INSTRUCTIONS)}
            original={null}
            display={cloneDeep(display[queries.length])}
            key={uuidv1()}
            index={queries.length}
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
          />
        </div>
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
