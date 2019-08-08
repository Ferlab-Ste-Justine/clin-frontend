/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Menu, Dropdown, Button, Icon, Checkbox, Divider,
} from 'antd';
import { cloneDeep, find, pull, pullAllBy, } from 'lodash';
import uuidv1 from 'uuid/v1';
import DragSortableList from 'react-drag-sortable';

import Query from './index'


class Statement extends React.Component {
  constructor() {
    super();
    this.state = {
      draft: null,
      original: null,
      versions: null,
      checkedQueries: null,
      queriesChecksAreIndeterminate: null,
      queriesAreAllChecked: null,
      display: {
        compoundOperators: null,
      },
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
    this.handleDuplicate = this.handleDuplicate.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleReorder = this.handleReorder.bind(this);
    this.handleUndo = this.handleUndo.bind(this);
    this.handleCheckQuery = this.handleCheckQuery.bind(this);
    this.handleCheckAllQueries = this.handleCheckAllQueries.bind(this);
    this.createMenuComponent = this.createMenuComponent.bind(this);
    this.handleRemoveChecked = this.handleRemoveChecked.bind(this);
    // this.handleMenuSelection = this.handleMenuSelection.bind(this);
  }

  componentWillMount() {
    const { data } = this.props;
    data.map((newDatum) => {
      newDatum.key = uuidv1();
      return newDatum;
    });
    this.setState({
      original: data,
      draft: [...data],
      versions: [],
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
      draft[query.index] = query.data
      this.setState({
        draft
      } )
    }
  }

  handleDuplicate(query) {
    if (this.isDuplicatable()) {
      const { draft } = this.state;
      const index = query.index + 1;
      const clone = cloneDeep(query);
      clone.data.key = uuidv1();
      if (clone.data.title) {
        clone.data.title += ' Copy';
      }
      draft.splice(index, 0, clone.data);
      this.setState({
        draft,
      });
    }
  }

  handleRemove(query) {
    if (this.isRemovable()) {
      const { draft } = this.state;
      const newDraft = pullAllBy(draft, [{ key: query.key }]);
      this.setState({
        draft: newDraft
      });
    }
  }

  handleReorder(sorted) {
    if (this.isReorderable()) {
      const { draft } = this.state;
      const sortedIndices = sorted.map(clip => clip.index);
      const sortedData = sortedIndices.map((sortedIndice) => {
        return draft[sortedIndice];
      })
      this.setState({
        draft: sortedData
      })
    }
  }

  handleSelect(item) {
    if (this.isSelectable()) {
      return true;
    }
  }

  handleUndo() {
    if (this.isUndoable()) {
      return true;
    }
  }

  handleCheckQuery(e) {
    const { checkedQueries, draft } = this.state;
    const { target } = e;
    const { value, checked } = target;
    if (!checked) {
      pull(checkedQueries, value)
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
  };

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
      const checkedQueries = draft.reduce((accumulator, query) => {
        return [...accumulator, query.key];
      }, []);
      this.setState({
        checkedQueries,
        queriesChecksAreIndeterminate: false,
        queriesAreAllChecked: true,
      });
    }
  };

  handleRemoveChecked() {
    if (this.isRemovable()) {
      const { checkedQueries, draft } = this.state;
      const keysToRemove = checkedQueries.reduce((accumulator, key) => {
        return [...accumulator, { key }];
      }, [])
      const newDraft = pullAllBy(draft, keysToRemove, 'key')
      this.setState({
        draft: newDraft,
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
        <Menu.Item key={"A"}>A</Menu.Item>
      </Menu>
    );
  }

  render() {
    const { draft, original, checkedQueries, queriesChecksAreIndeterminate, queriesAreAllChecked } = this.state;
    const { display, options } = this.props;
    const { reorderable, removable } = options;
    const checkedQueriesCount = checkedQueries.length;
    const queries = draft.reduce((accumulator, query, index) => {
      const isChecked = checkedQueries.indexOf(query.key) !== -1
      const initial = find(original, { key: query.key }) || null;
      return [...accumulator, (
          <div className='query-container'>
            <div className="selector">
              <Checkbox
                value={query.key}
                checked={isChecked}
                onChange={this.handleCheckQuery}
              />
            </div>
            <Query
              draft={query}
              original={initial}
              display={display}
              index={index}
              key={query.key}
              onCopyCallback={this.handleCopy}
              onEditCallback={this.handleEdit}
              onDuplicateCallback={this.handleDuplicate}
              onRemoveCallback={this.handleRemove}
              onSelectCallback={this.handleSelect}
              onUndoCallback={this.handleUndo}
              options={options}
            />
          </div>
        ) ]
    }, []);
    return (
        <div className="statement">
          <div className="action-container">
            <Checkbox
              key="check-all"
              className="selector"
              indeterminate={queriesChecksAreIndeterminate}
              onChange={this.handleCheckAllQueries}
              checked={queriesAreAllChecked}
            />
            <span className="actions">
              { removable && (
                  <Button icon="delete" size="small" disabled={(checkedQueriesCount < 1) ? true : false} onClick={this.handleRemoveChecked}>Delete</Button>
              ) }
            </span>
          </div>
          <Divider />
          {reorderable ?
            <DragSortableList
              key="sortable"
              type="vertical"
              items={queries.map((query, index) => { return {content: query, index} })}
              onSort={this.handleReorder}
            /> : queries
          }
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
