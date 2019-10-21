/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Typography, Card, Tag, Popover, Dropdown, Button, Icon, Pagination,
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
    this.state = {
      type: null,
      data: null,
      dataSet: null,
      draft: null,
      visible: null,
      selected: false,
      opened: null,
      allOptions: null,
      selection: [],
      size: null,
      page: null,
    };

    this.isEditable = this.isEditable.bind(this);
    this.isRemovable = this.isRemovable.bind(this);
    this.isSelectable = this.isSelectable.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.isOpened = this.isOpened.bind(this);
    this.isVisible = this.isVisible.bind(this);
    this.serialize = this.serialize.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleApply = this.handleApply.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);

    // @NOTE Initialize Component State
    const {
      data, dataSet, autoOpen, visible, sortData,
    } = props;
    this.state.data = data;
    this.state.dataSet = dataSet || [];
    this.state.draft = cloneDeep(data);
    this.state.selection = data.values ? cloneDeep(data.values) : [];
    this.state.opened = autoOpen;
    this.state.visible = visible;
    this.state.allOptions = cloneDeep(sortData);
    this.state.page = 1;
    this.state.size = 10;
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

  isSelected() {
    const { selected } = this.state;
    return selected === true;
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
      }, () => { onRemoveCallback(this.serialize()); });
    }
  }

  handleApply() {
    if (this.isEditable()) {
      const { draft } = this.state;
      const { editor, onEditCallback } = this.props;
      const value = editor.props.children[6].props.children.props.children.props.value;
      const operand = editor.props.children[0].props.children.props.children.props.value;
      if (value.length > 0) {
        draft.operand = operand;
        draft.values = value;
        this.setState({
          data: { ...draft },
          opened: false,
        }, () => {
          onEditCallback(this.serialize());
        });
      } else {
        this.handleClose(true);
      }
    }
  }

  handleCancel() {
    const { draft } = this.state;
    const { onCancelCallback } = this.props;
    this.setState({
      data: { ...draft },
      opened: false,
    }, () => {
      onCancelCallback(this.serialize());
    });
  }

  handleSelect() {
    if (this.isSelectable() && !this.isOpened()) {
      const { onSelectCallback } = this.props;
      this.setState({
        selected: !this.isSelected(),
      }, () => {
        onSelectCallback(this.serialize());
      });
    }
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

  render() {
    const {
      data, allOptions, size, page,
    } = this.state;
    const {
      intl, overlayOnly, editor, label, legend, content, dataSet,
    } = this.props;
    const titleText = intl.formatMessage({ id: 'screen.patientvariant.filter_'+data.id });
    const descriptionText = intl.formatMessage({ id: 'screen.patientvariant.filter_'+data.id+'.description'});
    const overlay = (
      <Popover
        visible={this.isOpened()}
      >
        <Card className="filterCard">
          <Typography.Title level={4}>{titleText}</Typography.Title>
          <Typography>{descriptionText}</Typography>
          <br />
          { editor }
          {
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
          color={this.isSelected() ? 'blue' : ''}
          onClick={this.handleSelect}
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
  sortData: PropTypes.array.isRequired,
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
};

export default Filter;
