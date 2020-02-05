import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import {
  Row, Col, Typography, Card, Tag, Popover, Dropdown, Button, Pagination, Input,
} from 'antd';
import {
  cloneDeep,
} from 'lodash';
import IconKit from 'react-icons-kit';
import { ic_cancel } from 'react-icons-kit/md';

import style from '../styles/term.module.scss';


export const INSTRUCTION_TYPE_FILTER = 'filter';
export const FILTER_TYPE_GENERIC = 'generic';
export const FILTER_TYPE_NUMERICAL_COMPARISON = 'numcomparison';
export const FILTER_TYPE_COMPOSITE = 'composite';
export const FILTER_TYPE_GENERICBOOL = 'genericbool';
export const FILTER_TYPE_SPECIFIC = 'specific';
export const FILTER_TYPES = [
  FILTER_TYPE_GENERIC,
  FILTER_TYPE_NUMERICAL_COMPARISON,
  FILTER_TYPE_COMPOSITE,
  FILTER_TYPE_SPECIFIC,
];

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
      visible: null,
      selected: null,
      opened: null,
      allOptions: [],
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
    this.handleSearchByQuery = this.handleSearchByQuery.bind(this);

    // @NOTE Initialize Component State
    const {
      autoOpen, autoSelect, visible, sortData,
    } = props;
    this.state.opened = autoOpen;
    this.state.visible = visible;
    this.state.selected = autoSelect;
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
      }, () => {
        onRemoveCallback(this.serialize());
      });
    }
  }

  handleApply() {
    if (this.isEditable()) {
      const {
        editor, onEditCallback, index,
      } = this.props;
      const instruction = editor.getDraftInstruction();
      instruction.index = index;

      this.setState({
        opened: false,
      }, () => {
        const instructionIsEmpty = !instruction.values || instruction.values.length === 0;
        if (instructionIsEmpty) {
          this.handleClose(true);
        } else {
          onEditCallback(instruction);
        }
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

  handleSearchByQuery(value) {
    const { onSearchCallback } = this.props;
    const search = value.target.value;
    onSearchCallback(search);
  }

  render() {
    const { allOptions, size, page } = this.state;
    const {
      data, overlayOnly, editor, searchable, autoSelect,
    } = this.props;
    const filterLabel = intl.get(`screen.patientvariant.filter_${data.id}`);
    const filterDescription = intl.get(`screen.patientvariant.filter_${data.id}.description`);
    const filterSearch = intl.get('screen.patientvariant.filter.search');
    const editorLabels = editor.getLabels();
    const actionLabel = editorLabels.action;
    const actionTargets = editorLabels.targets;
    const overlay = (
      <Popover
        visible={this.isOpened()}
      >
        <Card className="filterCard">
          <Typography.Title level={4}>{filterLabel}</Typography.Title>
          <Typography>{filterDescription}</Typography>
          <br />
          {searchable && (
          <>
            <Row>
              <Input
                allowClear
                placeholder={filterSearch}
                size="small"
                onChange={this.handleSearchByQuery}
              />
            </Row>
            <br />
          </>
          )}
          { editor.contents }
          { allOptions && (
            allOptions.length >= size
              ? (
                <Row>
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
          )}
          <br />
          <Row type="flex" justify="end">
            <Col>
              <Button onClick={this.handleCancel}>
                { intl.get('components.query.filter.button.cancel') }
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                onClick={this.handleApply}
              >
                { intl.get('components.query.filter.button.apply') }
              </Button>
            </Col>
          </Row>
        </Card>
      </Popover>
    );

    if (overlayOnly === true) {
      return (
        <Dropdown
          trigger="click"
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
          visible={this.isVisible()}
          onClose={this.handleClose}
          color={autoSelect ? '#b5e6f7' : '#d1deea'}
          className={autoSelect ? `${style.tag} ${style.selectedTag}` : `${style.tag} `}
        >
          <Tag
            color={autoSelect ? '#e2f5fc' : '#E9EFF5 '}
            className={`${style.insideTag}`}
          >
            { filterLabel }
          </Tag>
          <Tag
            color={autoSelect ? '#b5e6f7' : '#d1deea'}
            className={`${style.insideTag} ${style.operator}`}
          >
            { actionLabel }
          </Tag>
          { this.isEditable() && (
            <Dropdown
              trigger="click"
              onVisibleChange={this.toggleMenu}
              overlay={overlay}
              visible={this.isOpened()}
              placement="bottomLeft"
            >
              <Tag
                onClick={this.toggleMenu}
                color="#FFFFFF"
                className={`${style.insideTag}`}
              >
                {actionTargets.map((target, index) => (
                  <>
                    {index !== 0 ? ' • ' : null } {target}
                  </>
                ))}
              </Tag>
            </Dropdown>
          ) }
          {autoSelect
            ? <IconKit className={`${style.closingIcon}`} onClick={this.handleClose} size={16} icon={ic_cancel} />
            : null}
        </Tag>
      </span>
    );
  }
}

Filter.propTypes = {
  data: PropTypes.shape({}).isRequired,
  options: PropTypes.shape({}),
  onCancelCallback: PropTypes.func,
  onEditCallback: PropTypes.func,
  onRemoveCallback: PropTypes.func,
  onSelectCallback: PropTypes.func,
  onSearchCallback: PropTypes.func,
  onPageChangeCallBack: PropTypes.func,
  editor: PropTypes.shape({}).isRequired,
  legend: PropTypes.shape({}).isRequired,
  content: PropTypes.shape({}).isRequired,
  autoOpen: PropTypes.bool,
  overlayOnly: PropTypes.bool,
  visible: PropTypes.bool,
  searchable: PropTypes.bool,
  sortData: PropTypes.array,
  autoSelect: PropTypes.bool,
  index: PropTypes.number,
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
  onSearchCallback: () => {},
  onPageChangeCallBack: () => {},
  autoOpen: false,
  autoSelect: false,
  overlayOnly: false,
  visible: true,
  searchable: false,
  sortData: [],
  index: 0,
};

export default Filter;
