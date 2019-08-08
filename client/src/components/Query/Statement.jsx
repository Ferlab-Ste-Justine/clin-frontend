/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Menu, Dropdown, Button, Icon,
} from 'antd';
import { cloneDeep, pullAllBy } from 'lodash';
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
    this.createMenuComponent = this.createMenuComponent.bind(this);
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
      const clone = cloneDeep(item);
      clone.draft.key = uuidv1();
      clone.draft.index = index;
      draft.splice(index, 0, clone.draft);
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
    const { draft, original } = this.state;
    const { display, options } = this.props;
    const { reorderable } = options;
    const queries = draft.reduce((accumulator, query, index) => {
      return [...accumulator, (
          <div className='query-container'>
            {/*<div className="actions"></div>*/}
            <Query
              draft={query}
              original={original[index]}
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
