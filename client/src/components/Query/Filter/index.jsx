import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import {
  Row, Col, Typography, Card, Tag, Popover, Dropdown, Button, Menu, Pagination, Input, Icon, Tooltip,
} from 'antd';
import {
  cloneDeep,
} from 'lodash';
import IconKit from 'react-icons-kit';
import {
  ic_cancel, ic_info_outline, ic_search, ic_chevron_left,
} from 'react-icons-kit/md';

import style from '../styles/term.module.scss';
import styleFilter from '../styles/filter.module.scss';

import {
  getSvgPathFromOperatorType,
  OPERATOR_TYPE_UNION,
  OPERATOR_TYPE_INTERSECTION,
  OPERATOR_TYPE_EXCLUSION,
} from '../Operator';

export const FILTER_OPERAND_TYPE_ALL = 'all';
export const FILTER_OPERAND_TYPE_ONE = 'one';
export const FILTER_OPERAND_TYPE_NONE = 'none';
export const FILTER_OPERAND_TYPE_DEFAULT = FILTER_OPERAND_TYPE_ONE;

const operatorFromOperand = (operand) => {
  switch (operand) {
    case FILTER_OPERAND_TYPE_ONE:
      return OPERATOR_TYPE_UNION;
    case FILTER_OPERAND_TYPE_ALL:
      return OPERATOR_TYPE_INTERSECTION;
    case FILTER_OPERAND_TYPE_NONE:
      return OPERATOR_TYPE_EXCLUSION;
    default:
      return OPERATOR_TYPE_UNION;
  }
};

export const OperatorIconComponent = operand => props => (
  <svg width="10em" height="10em" viewBox="0 0 24 24" {...props}>
    {getSvgPathFromOperatorType(operand)}
  </svg>
);

const IconForOperand = operand => props => (
  <Icon
    {...props}
    className={styleFilter.svgIcon}
    component={OperatorIconComponent(operatorFromOperand(operand))}
  />
);

// const IntersectionSvg = require('../../../icons/intersection.svg');

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
      visibleInput: false,
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
    this.handleInputView = this.handleInputView.bind(this);

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
        if (
          (!instruction.values && !instruction.value)
          || (instruction.values && instruction.values.length === 0)
          || (instruction.value && instruction.value.length === 0)) {
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

  handleInputView() {
    const { visibleInput } = this.state;
    this.setState({ visibleInput: !visibleInput });
  }


  render() {
    const {
      onOperandChangeCallBack, config, data, draft, overlayOnly, editor, searchable, autoSelect,
    } = this.props;
    const {
      allOptions, size, page, visibleInput,
    } = this.state;

    const handleMenuClick = (e) => {
      onOperandChangeCallBack(e.key);
    };

    const applyMenu = cfg => (!cfg ? null : (
      <Menu onClick={e => handleMenuClick(e)}>
        {cfg.operands.map(configOperand => (
          <Menu.Item key={configOperand}>
            <Icon className={styleFilter.graySvgIcon} component={OperatorIconComponent(operatorFromOperand(configOperand))} />
          </Menu.Item>
        ))}
      </Menu>
    ));

    const hasOperands = cfg => cfg && config.operands;
    const { operand } = draft;

    const ApplyButton = ({ cfg }) => (hasOperands(cfg) ? (
      <Dropdown.Button
        type="primary"
        className={`composite-filter-apply-button ${styleFilter.dropDownApplyButton}`}
        icon={(
          <Icon
            component={OperatorIconComponent(operatorFromOperand(operand))}
          />
          )}
        onClick={this.handleApply}
        overlay={applyMenu(cfg)
        }
        placement="bottomLeft"
      >
        {intl.get('components.query.filter.button.apply')}
      </Dropdown.Button>
    ) : (
      <Button
        type="primary"
        onClick={this.handleApply}
        className={`composite-filter-apply-button ${styleFilter.applyButton}`}
      >
        {intl.get('components.query.filter.button.apply') }
      </Button>
    ));
    const filterLabel = intl.get(`screen.patientvariant.filter_${data.id}`);
    const filterDescription = intl.get(`screen.patientvariant.filter_${data.id}.description`);
    const filterSearch = intl.get('screen.patientvariant.filter.search');
    const valueText = intl.get('screen.patientvariant.filter.pagination.value');
    const editorLabels = editor.getLabels();
    const actionLabel = editorLabels.action;
    const actionTargets = editorLabels.targets;
    const overlay = (
      <Popover
        visible={this.isOpened()}
      >
        <Card className={styleFilter.filterCard}>
          <div className={styleFilter.fieldHeader}>
            <Row type="flex" justify="start" align="middle">
              <Typography.Title className={styleFilter.labelTitle}>
                {filterLabel}
              </Typography.Title>
              <Tooltip overlayClassName={styleFilter.tooltip} placement="right" title={filterDescription}>
                <Button>
                  <IconKit size={16} className={styleFilter.iconInfo} icon={ic_info_outline} />
                </Button>
              </Tooltip>
              <Button className={styleFilter.iconSearch} onClick={this.handleInputView}>
                <IconKit size={24} icon={ic_search} />
              </Button>
            </Row>

            {searchable && (
            <>
              <Row>
                <Input
                  allowClear
                  placeholder={filterSearch}
                  onChange={this.handleSearchByQuery}
                  className={visibleInput ? `${styleFilter.searchInput}` : `${styleFilter.searchInputClose}`}
                />
              </Row>
            </>
            )}
          </div>

          { editor.contents }
          { allOptions && (
            allOptions.length >= size
              ? (
                <Row className={styleFilter.paginationInfo} type="flex" align="middle" justify="space-between">
                  <Col>{allOptions.length} {valueText}</Col>
                  <Col>
                    <Pagination
                      className={styleFilter.pagination}
                      total={allOptions.length}
                      pageSize={size}
                      current={page}
                      pageSizeOptions={['10', '25', '50', '100']}
                      onChange={this.handlePageChange}
                      size="small"
                    />
                  </Col>
                </Row>
              ) : null
          )}
          <Row type="flex" justify="end" className={styleFilter.actionToolBar}>
            <Col>
              <Button onClick={this.handleCancel} className={styleFilter.cancelButton}>
                <IconKit size={16} icon={ic_chevron_left} />
                { intl.get('components.query.filter.button.cancel') }
              </Button>
            </Col>
            <Col>
              <ApplyButton cfg={config} />
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
          <div
            color={autoSelect ? '#b5e6f7' : '#d1deea'}
            className={`${style.insideTag} ${style.operator}`}
          >
            {operand ? IconForOperand(operand)() : actionLabel}
          </div>
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
  config: PropTypes.shape({}).isRequired,
  data: PropTypes.shape({}).isRequired,
  options: PropTypes.shape({}),
  onCancelCallback: PropTypes.func,
  onEditCallback: PropTypes.func,
  onRemoveCallback: PropTypes.func,
  onSelectCallback: PropTypes.func,
  onSearchCallback: PropTypes.func,
  onPageChangeCallBack: PropTypes.func,
  onOperandChangeCallBack: PropTypes.func,
  editor: PropTypes.shape({}).isRequired,
  legend: PropTypes.shape({}).isRequired,
  content: PropTypes.shape({}).isRequired,
  draft: PropTypes.shape({}),
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
  onOperandChangeCallBack: () => {},
  draft: {},
  autoOpen: false,
  autoSelect: false,
  overlayOnly: false,
  visible: true,
  searchable: false,
  sortData: [],
  index: 0,
};

export default Filter;
