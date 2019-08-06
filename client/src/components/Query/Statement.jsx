/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Menu, Dropdown, Button, Icon,
} from 'antd';
import uuidv1 from 'uuid/v1';
import DragSortableList from 'react-drag-sortable';

import Query from './index'


class Statement extends React.Component {
  constructor() {
    super();
    this.state = {
      data: null,
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
    const { options, data } = this.props;

    console.log(data)

    data.map((newDatum) => {
      newDatum.key = uuidv1();
      return newDatum;
    });

    console.log(data)

    this.setState({
      data,
      options,
    });
  }

  isCopyable() {
    const { options } = this.state;
    const { copyable } = options;
    return copyable === true;
  }

  isDuplicatable() {
    const { options } = this.state;
    const { duplicatable } = options;
    return duplicatable === true;
  }

  isEditable() {
    const { options } = this.state;
    const { editable } = options;
    return editable === true;
  }

  isRemovable() {
    const { options } = this.state;
    const { removable } = options;
    return removable === true;
  }

  isReorderable() {
    const { options } = this.state;
    const { reorderable } = options;
    return reorderable === true;
  }

  isSelectable() {
    const { options } = this.state;
    const { selectable } = options;
    return selectable === true;
  }

  isUndoable() {
    const { options } = this.state;
    const { undoable } = options;
    return undoable === true;
  }

  handleCopy() {
    if (this.isCopyable()) {
      return true;
    }
  }

  handleEdit(data) {

    console.log(data)

    if (this.isEditable()) {
      this.setState({
        data
      })
    }
  }

  handleDuplicate(item) {
    if (this.isDuplicatable()) {
      const {data} = this.state;
      const index = item.index + 1;
      data.splice(index, 0, item.data);
      this.setState({
        data,
      });
    }
  }

  handleRemove(item) {
    if (this.isRemovable()) {
      const {data} = this.state;
      data.splice(item.index, 1);
      this.setState({
        data,
      });
    }
  }

  handleReorder(sorted) {
    if (this.isReorderable()) {
      const { data } = this.state;
      const sortedIndices = sorted.map(clip => clip.index);
      const sortedData = sortedIndices.map((sortedIndice) => {
        return data[sortedIndice];
      })
      this.setState({
        data: sortedData
      })
    }
  }

  handleSelect(item) {
    if (this.isSelectable()) {
      return true;
    }
  }

  handleUndo(item) {
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
    const { data, options } = this.state;
    const { reorderable } = options;
    const queries = data.reduce((accumulator, item, index) => {
      return [...accumulator, (
          <div className='query-container'>
            {/*<div className="actions"></div>*/}
            <Query
              key={item.key}
              index={index}
              data={item}
              options={options}
              onCopyCallback={this.handleCopy}
              onEditCallback={this.handleEdit}
              onDuplicateCallback={this.handleDuplicate}
              onRemoveCallback={this.handleRemove}
              onSelectCallback={this.handleSelect}
              onUndoCallback={this.handleUndo}
            />
          </div>
        ) ]
    }, []);
    return (
        <div className="statement">
          {reorderable ?
              <DragSortableList key="sortable" items={queries.map((query, index) => { return {content: query, index} })} onSort={this.handleReorder} type="vertical"/> : queries
          }
        </div>
    );
  }
}

Statement.propTypes = {
  data: PropTypes.shape([]).isRequired,
  options: PropTypes.shape({}),
};

Statement.defaultProps = {
  options: {
    copyable: false,
    duplicatable: false,
    editable: true,
    removable: false,
    reorderable: false,
    selectable: false,
    undoable: false,
  },
};

export default Statement;
