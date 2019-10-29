/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Typography, Card, Tag, Popover, Dropdown, Button, Icon, Pagination,Input
} from 'antd';
import {
  cloneDeep,
} from 'lodash';

export const INSTRUCTION_TYPE_FILTER = 'filter';
export const FILTER_TYPE_GENERIC = 'generic';
export const FILTER_TYPE_NUMERICAL_COMPARISON = 'numcomparison';
export const FILTER_TYPE_GENERICBOOL = 'genericbool'
export const FILTER_TYPE_SPECIFIC = 'specific';
export const FILTER_TYPES = [FILTER_TYPE_GENERIC, FILTER_TYPE_NUMERICAL_COMPARISON, FILTER_TYPE_SPECIFIC];

export const createFilter = type => ({
  type: INSTRUCTION_TYPE_FILTER,
  data: {
    type: (FILTER_TYPES.indexOf(type) !== -1 ? type : FILTER_TYPE_GENERIC),
  },
});

class Filter extends React.Component {
  constructor(props) {
    super(props);
    const { dataSet = [], autoOpen, visible, sortData } = props;
    this.state = {
      dataSet,
      visible,
      opened: autoOpen,
      allOptions: cloneDeep(sortData),
      size: 10,
      page: 1,
    };

    this.isEditable = this.isEditable.bind(this);
    this.isRemovable = this.isRemovable.bind(this);
    this.isSelectable = this.isSelectable.bind(this);
    this.isOpened = this.isOpened.bind(this);
    this.isVisible = this.isVisible.bind(this);
    this.serialize = this.serialize.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleApply = this.handleApply.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleSearchByQuery = this.handleSearchByQuery.bind(this)
  }

  isEditable() {
    const { options } = this.props;
    const { editable } = options;
    return editable === true;
  }

  isSelectable() {
    const { options } = this.props;
    const { selectable } = options;
    return selectable === true;
  }

  isRemovable() {
    const { options } = this.props;
    const { removable } = options;
    return removable === true;
  }

  isVisible() {
    const { visible } = this.state;
    return visible === true;
  }

  isOpened() {
    const { opened } = this.state;
    return opened === true;
  }

  serialize() {
    return Object.assign({}, this.props, this.state);
  }

  handleClose(force = false) {
    if (force === true || this.isRemovable()) {
      const { onRemoveCallback } = this.props;
      this.setState({
        opened: false,
        visible: false,
      }, () => {
        onRemoveCallback(this.serialize());
      });
    }
  }

  handleApply() {
    if (this.isEditable()) {
      const { editor, onEditCallback, data, type } = this.props;
      const { id } = data;
      let instruction = { id, type };
      if (type === FILTER_TYPE_GENERIC) {
        instruction.values = editor.props.children[4].props.children.props.children.props.value;
        instruction.operand = editor.props.children[0].props.children.props.children.props.value;
        if (instruction.values.length === 0) {
          this.handleClose(true);
        }
      } else if (type === FILTER_TYPE_NUMERICAL_COMPARISON) {
        instruction.comparator = editor.props.children[0].props.children.props.children.props.value;
        instruction.value = editor.props.children[2].props.children[1].props.children.props.defaultValue;
      } else if (type === FILTER_TYPE_GENERICBOOL) {
        instruction.values = editor.props.children[2].props.children.props.children.props.value
      }
      onEditCallback(instruction);
      this.setState({
        opened: false,
      });
   }
  }

  handleCancel() {
    const { onCancelCallback } = this.props;
    this.setState({
      opened: false,
    }, () => {
      onCancelCallback(this.serialize());
    });
  }

  toggleMenu() {
    this.setState({ opened: !this.isOpened() });
  }

  handlePageChange(page, size) {
    const { onPageChangeCallBack } = this.props;
    this.setState({
      page,
      size,
    }, () => {
      onPageChangeCallBack(page, size);
    });
  }

  handleSearchByQuery(value){
      const { onSearchCallback } = this.props;
      const search = value.target.value
      onSearchCallback(search);
  }

  render() {
    const { allOptions, size, page } = this.state;
    const { data, intl, overlayOnly, editor, label, legend, content, dataSet, searchable } = this.props;
    const titleText = intl.formatMessage({ id: 'screen.patientvariant.filter_'+data.id });
    const descriptionText = intl.formatMessage({ id: 'screen.patientvariant.filter_'+data.id+'.description'});
    const filterSearch = intl.formatMessage({ id: 'screen.patientvariant.filter.search' });
    const overlay = (
      <Popover
        visible={this.isOpened()}
      >
        <Card className="filterCard">
          <Typography.Title level={4}>{titleText}</Typography.Title>
          <Typography>{descriptionText}</Typography>
          <br />
          {searchable  && (
               <>
               <Row>
                 <Input
                   allowClear
                   placeholder={filterSearch}
                   size="small"
                   onChange={this.handleSearchByQuery}
                 />
               </Row>
               <br/>
               </>
          )
          }

          { editor }

          { allOptions  && (
                allOptions.length >= size
                  ? (
                    <Row style={{ marginTop: 'auto' }}>
                      <br />
                      <Col align="end" span={24}>
                        <Pagination
                          total={allOptions.length}
                          pageSize={size}
                          current={page}
                          pageSizeOptions={['10', '25', '50', '100']}
                          onChange={this.handlePageChange}
                        />
                      </Col>
                    </Row>
                  ) : null
          )
          }

          <br />
          <Row type="flex" justify="end" style={dataSet.length < 10 ? { marginTop: 'auto' } : null}>
            <Col>
              <Button onClick={this.handleCancel}>Annuler</Button>
            </Col>
            <Col>
              <Button style={{ marginLeft: '8px' }} type="primary" onClick={this.handleApply}>Appliquer</Button>
            </Col>
          </Row>
        </Card>
      </Popover>
    );

    if (overlayOnly === true) {
      return (
        <Dropdown
          onVisibleChange={this.toggleMenu}
          overlay={overlay}
          visible={this.isOpened()}
          placement="bottomLeft"
        >
          <span />
        </Dropdown>
      );
    }
    return (
      <span>
        <Tag
          className="filter"
          visible={this.isVisible()}
          closable={this.isRemovable()}
          onClose={this.handleClose}
          color={this.isOpened() ? 'blue' : ''}
        >
          <Popover
            className="legend"
            trigger="hover"
            placement="topLeft"
            content={content}
          >
            { legend }
          </Popover>
          <span onClick={this.toggleMenu}>
            { label }
          </span>
          { this.isEditable() && (
          <Dropdown overlay={overlay} visible={this.isOpened()} placement="bottomLeft">
            <Icon type="caret-down" onClick={this.toggleMenu} />
          </Dropdown>
          ) }
        </Tag>
      </span>
    );
  }
}

Filter.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  data: PropTypes.shape({}).isRequired,
  dataSet: PropTypes.array.isRequired,
  type:PropTypes.string.isRequired,
  options: PropTypes.shape({}),
  onCancelCallback: PropTypes.func,
  onEditCallback: PropTypes.func,
  onRemoveCallback: PropTypes.func,
  onSelectCallback: PropTypes.func,
  editor: PropTypes.shape({}).isRequired,
  label: PropTypes.string,
  legend: PropTypes.shape({}).isRequired,
  content: PropTypes.shape({}).isRequired,
  autoOpen: PropTypes.bool,
  overlayOnly: PropTypes.bool,
  visible: PropTypes.bool,
  sortData: PropTypes.array,
};

Filter.defaultProps = {
  options: {
    editable: false,
    selectable: false,
    removable: false,
  },
  onCancelCallback: () => {},
  onEditCallback: () => {},
  onRemoveCallback: () => {},
  onSelectCallback: () => {},
  label: '',
  autoOpen: false,
  overlayOnly: false,
  visible: true,
  sortData:[]
};

export default Filter;
