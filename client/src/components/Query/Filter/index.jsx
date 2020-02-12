import React from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import {
  Row, Col, Typography, Card, Tag, Popover, Dropdown, Button, Menu, Pagination, Input, Tooltip,
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

const svgPathAll = (<path id="union-a" d="M9.04996157,15.7500378 C8.34998719,15.0675628 8,14.1842168 8,13.1 L8,4 L5,4 L5,13.1 C5,15.2843345 5.57858424,16.9550859 6.73575271,18.1122544 C7.89292119,19.2694229 9.64767029,19.8986714 12,20 L12.3664544,19.9796136 C14.5353848,19.8309723 16.1679824,19.2085193 17.2642473,18.1122544 C18.3605122,17.0159895 18.9374937,15.4587804 18.9951918,13.4406269 L19,13.1 L19,4 L16,4 L16,13.1 C16,14.1842168 15.6500128,15.0675628 14.9500384,15.7500378 C14.3039082,16.3800147 13.4163252,16.7834934 12.2872892,16.9604736 L12,17 C10.7332821,16.8491669 9.74993595,16.4325128 9.04996157,15.7500378 Z" />);
const svgPathOne = (<path id="intersection-a" d="M9.04996157,8.24996219 C8.34998719,8.93243721 8,9.81578315 8,10.9 L8,20 L5,20 L5,10.9 C5,8.71566554 5.57858424,7.04491407 6.73575271,5.88774559 C7.89292119,4.73057712 9.64767029,4.10132859 12,4 L12.3664544,4.0203864 C14.5353848,4.16902765 16.1679824,4.79148072 17.2642473,5.88774559 C18.3605122,6.98401047 18.9374937,8.54121963 18.9951918,10.5593731 L19,10.9 L19,20 L16,20 L16,10.9 C16,9.81578315 15.6500128,8.93243721 14.9500384,8.24996219 C14.3039082,7.61998525 13.4163252,7.21650664 12.2872892,7.03952636 L12,7 C10.7332821,7.15083311 9.74993595,7.56748717 9.04996157,8.24996219 Z" />);
const svgPathNone = (<polygon id="exclusion-a" points="15.447 3 14.106 8 20 8 20 11 13.302 11 12.766 13 20 13 20 16 11.962 16 10.623 21 8.553 21 9.892 16 4 16 4 13 10.696 13 11.231 11 4 11 4 8 12.035 8 13.376 3" />);

export const getSvgPathFromOperandType = (type) => {
  console.log('coucou');
  switch (type) {
    default:
    case 'all':
      return svgPathAll;
    case 'one':
      return svgPathOne;
    case 'none':
      return svgPathNone;
  }
};
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
        if ((!instruction.values && !instruction.value) || (instruction.values && instruction.values.length === 0) || (instruction.value && instruction.value.length === 0)) {
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
      allOptions, size, page, visibleInput,
    } = this.state;
    const { onOperandChange, config } = this.props;

    const handleMenuClick = (e) => {
      onOperandChange(e.key);
    };
    const applyMenu = cfg => (!cfg ? null : (
      <Menu onClick={e => handleMenuClick(e)} className={styleFilter.operandDropdown}>
        {cfg.operands.map(configOperand => (
          <Menu.Item key={configOperand}>
            <svg className={styleFilter.svgIcon}>{ getSvgPathFromOperandType(configOperand) }</svg>
            {intl.get(`screen.patientvariant.filter.operand.${configOperand}`)}
          </Menu.Item>
        ))}
      </Menu>
    ));

    const hasOperands = cfg => cfg && config.operands;
    const ApplyButton = ({ cfg }) => (hasOperands(cfg) ? (
      <Dropdown.Button type="primary" onClick={this.handleApply} overlay={applyMenu(cfg)} className={styleFilter.applyButton} placement="bottomLeft">
        {intl.get('components.query.filter.button.apply')}
      </Dropdown.Button>
    ) : (
      <Button
        type="primary"
        onClick={this.handleApply}
      >
        {intl.get('components.query.filter.button.apply') }
      </Button>
    ));

    const {
      data, overlayOnly, editor, searchable, autoSelect,
    } = this.props;
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
  config: PropTypes.shape({}).isRequired,
  data: PropTypes.shape({}).isRequired,
  options: PropTypes.shape({}),
  onCancelCallback: PropTypes.func,
  onEditCallback: PropTypes.func,
  onRemoveCallback: PropTypes.func,
  onSelectCallback: PropTypes.func,
  onSearchCallback: PropTypes.func,
  onPageChangeCallBack: PropTypes.func,
  onOperandChange: PropTypes.func,
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
  onOperandChange: () => { },
  autoOpen: false,
  autoSelect: false,
  overlayOnly: false,
  visible: true,
  searchable: false,
  sortData: [],
  index: 0,
};

export default Filter;
