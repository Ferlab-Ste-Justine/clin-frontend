import React, { Fragment } from 'react';
import IconKit from 'react-icons-kit';
import {
  ic_cancel,
} from 'react-icons-kit/md';
import intl from 'react-intl-universal';
import Icon from '@ant-design/icons';
import {
  Dropdown,
  Tag,
} from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import PropTypes from 'prop-types';
import shortid from 'shortid';

import {
  OPERATOR_TYPE_EQUAL,
  OPERATOR_TYPE_INTERSECTION,
  OPERATOR_TYPE_NOT_EQUAL,
  OPERATOR_TYPE_UNION,
  OperatorIconComponent,
} from '../Operator';

import FilterContent from './FilterContent';

import 'style/themes/clin/dist/antd.css';
import styleFilter from '../styles/filter.module.scss';
import style from '../styles/term.module.scss';

export const FILTER_OPERAND_TYPE_ALL = 'all';
export const FILTER_OPERAND_TYPE_ONE = 'one';
export const FILTER_OPERAND_TYPE_NONE = 'none';
export const FILTER_OPERAND_TYPE_DEFAULT = FILTER_OPERAND_TYPE_ONE;

const OuterOperatorFromOperand = (operand) => {
  switch (operand) {
    case FILTER_OPERAND_TYPE_ONE:
      return OPERATOR_TYPE_EQUAL;
    case FILTER_OPERAND_TYPE_ALL:
      return OPERATOR_TYPE_EQUAL;
    case FILTER_OPERAND_TYPE_NONE:
      return OPERATOR_TYPE_NOT_EQUAL;
    default:
      return OPERATOR_TYPE_EQUAL;
  }
};

const InnerOperatorFromOperand = (operand) => {
  switch (operand) {
    case FILTER_OPERAND_TYPE_ONE:
      return OPERATOR_TYPE_UNION;
    case FILTER_OPERAND_TYPE_ALL:
      return OPERATOR_TYPE_INTERSECTION;
    case FILTER_OPERAND_TYPE_NONE:
      return OPERATOR_TYPE_UNION;
    default:
      return OPERATOR_TYPE_UNION;
  }
};
const PillOuterIconForOperand = (operand) => (props) => (
  <Icon
    {...props}
    className={styleFilter.svgIcon}
    component={OperatorIconComponent(OuterOperatorFromOperand(operand))}
  />
);

const PillInnerIconForOperand = (operand) => (props) => (
  <Icon
    {...props}
    className={style.innerIconOperand}
    component={OperatorIconComponent(InnerOperatorFromOperand(operand))}
  />

);

export const INSTRUCTION_TYPE_FILTER = 'filter';
export const FILTER_TYPE_GENERIC = 'generic';
export const FILTER_TYPE_NUMERICAL_COMPARISON = 'numcomparison';
export const FILTER_TYPE_COMPOSITE = 'composite';
export const FILTER_TYPE_GENERICBOOL = 'genericbool';
export const FILTER_TYPE_SPECIFIC = 'specific';
export const FILTER_TYPE_AUTOCOMPLETE = 'autocomplete';
export const FILTER_TYPES = [
  FILTER_TYPE_GENERIC,
  FILTER_TYPE_NUMERICAL_COMPARISON,
  FILTER_TYPE_COMPOSITE,
  FILTER_TYPE_SPECIFIC,
  FILTER_TYPE_AUTOCOMPLETE,
];

export const createFilter = (type) => ({
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

  componentDidUpdate() {
    const { visibleInput } = this.state;
    const { data } = this.props;
    const input = document.querySelector(`.${data.id}searchInput`);
    if (input && visibleInput) {
      input.firstChild.focus();
    }
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
    return { ...this.props, ...this.state };
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
        editor, onEditCallback, index, onApply,
      } = this.props;
      const instruction = editor.getDraftInstruction();
      instruction.index = index;
      this.setState({
        opened: false,
      }, () => {
        onApply();
        if (instruction.type !== 'autocomplete') {
          if (
            (!instruction.values && !instruction.value)
          || (instruction.values && instruction.values.length === 0)
          || (instruction.value && instruction.value.length === 0)) {
            this.handleClose(true);
          } else {
            onEditCallback(instruction);
          }
        } else if (instruction.selection.length === 0) {
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
      visibleInput: false,
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

  pillOuterOperatorIcon() {
    const { data, editor } = this.props;
    const { operand } = data;
    const editorLabels = editor.getLabels();
    const actionLabel = editorLabels.action;
    if (this.hasOperands()) {
      return PillOuterIconForOperand(operand)();
    }

    if (this.isAutocompleteFilter()) {
      return PillOuterIconForOperand(editor.getLabels().action)();
    }

    if (this.isNumericalComparisonFilter() || this.isCompositeFilter()) {
      const {
        getPillOuterIcon,
      } = this.props;
      return getPillOuterIcon();
    }

    return actionLabel;
  }

  termList() {
    const { data, editor } = this.props;
    const { operand } = data;

    const editorLabels = editor.getLabels();
    const actionTargets = editorLabels.targets;
    return (
      <div className={style.termList}>
        { actionTargets.map((target, index) => (
          <Fragment key={shortid.generate()}>
            { index !== 0 ? PillInnerIconForOperand(operand)() : null }{ target }
          </Fragment>
        )) }
      </div>
    );
  }

  hasOperands() {
    const { config } = this.props;
    return config.operands;
  }

  isNumericalComparisonFilter() {
    const { type } = this.props;

    return type === FILTER_TYPE_NUMERICAL_COMPARISON;
  }

  isCompositeFilter() {
    const { type } = this.props;

    return type === FILTER_TYPE_COMPOSITE;
  }

  isAutocompleteFilter() {
    const { type } = this.props;

    return type === FILTER_TYPE_AUTOCOMPLETE;
  }

  render() {
    const {
      onOperandChangeCallBack,
      config,
      data,
      draft,
      overlayOnly,
      editor,
      resettable,
      searchable,
      autoSelect,
      onReset,
      getPillContent,
      canApply,
    } = this.props;
    const {
      allOptions, selected,
    } = this.state;

    const savedOperand = data.operand;
    const haveChange = (
      (data.type === 'generic' || data.type === 'specific' || data.type === 'genericbool')
      && draft.values.length === 0 && !selected
    ) || (data.type === 'numcomparison' && !selected && draft.values[0].value === 0 && draft.values[1].value === 0)
      ? true : null;
    const filterLabel = intl.get(`screen.patientvariant.filter_${data.id}`);
    const editorLabels = editor.getLabels();

    const actionTargets = editorLabels.targets;
    if (data.id === 'gene_symbol') {
      actionTargets.sort();
    }
    const filterContent = (
      <FilterContent
        canApply={canApply}
        config={config}
        data={data}
        editor={editor}
        hasChanges={haveChange}
        onApply={this.handleApply}
        onCancelCallback={this.handleCancel}
        onOperandChangeCallBack={onOperandChangeCallBack}
        onReset={onReset}
        onSearchCallback={this.handleSearchByQuery}
        resettable={resettable}
        searchable={searchable}
        allOptions={allOptions}
      />
    );

    if (overlayOnly === true) {
      return filterContent;
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
            { this.pillOuterOperatorIcon() }
          </div>
          { this.isEditable() && (
            <Dropdown
              trigger={['click']}
              onVisibleChange={this.toggleMenu}
              overlay={filterContent}
              visible={this.isOpened()}
              placement="bottomLeft"
            >
              <Tag
                onClick={this.toggleMenu}
                color="#FFFFFF"
                className={`${style.insideTag}`}
              >
                { this.isNumericalComparisonFilter() || this.isCompositeFilter()
                  ? getPillContent()
                  : (
                    <div className={style.termList}>
                      { actionTargets.map((target, index) => (
                        <Fragment key={shortid.generate()}>
                          { index !== 0 ? PillInnerIconForOperand(savedOperand)() : null }{ target }
                        </Fragment>
                      )) }
                    </div>
                  ) }

              </Tag>
            </Dropdown>
          ) }
          { autoSelect
            ? <IconKit className={`${style.closingIcon}`} onClick={this.handleClose} size={16} icon={ic_cancel} />
            : null }
        </Tag>
      </span>
    );
  }
}

Filter.propTypes = {
  type: PropTypes.string,
  config: PropTypes.shape({}),
  data: PropTypes.shape({}).isRequired,
  draft: PropTypes.shape({}),
  options: PropTypes.shape({}),
  onReset: PropTypes.func,
  onCancelCallback: PropTypes.func,
  onEditCallback: PropTypes.func,
  onRemoveCallback: PropTypes.func,
  onSelectCallback: PropTypes.func,
  onSearchCallback: PropTypes.func,
  onPageChangeCallBack: PropTypes.func,
  onOperandChangeCallBack: PropTypes.func,
  editor: PropTypes.shape({}).isRequired,
  autoOpen: PropTypes.bool,
  overlayOnly: PropTypes.bool,
  visible: PropTypes.bool,
  searchable: PropTypes.bool,
  resettable: PropTypes.bool,
  sortData: PropTypes.array,
  autoSelect: PropTypes.bool,
  index: PropTypes.number,
  getPillContent: PropTypes.func,
  getPillOuterIcon: PropTypes.func,
  canApply: PropTypes.bool,
  onApply: PropTypes.func,
};

Filter.defaultProps = {
  type: '',
  config: {},
  draft: {},
  options: {
    editable: false,
    selectable: false,
    removable: false,
  },
  canApply: true,
  onReset: () => {},
  onCancelCallback: () => {},
  onEditCallback: () => {},
  onRemoveCallback: () => {},
  onSelectCallback: () => {},
  onSearchCallback: () => {},
  onPageChangeCallBack: () => {},
  onOperandChangeCallBack: () => {},
  onApply: () => {},
  autoOpen: false,
  autoSelect: false,
  overlayOnly: false,
  visible: true,
  searchable: false,
  resettable: false,
  sortData: [],
  index: 0,
  getPillContent: () => {},
  getPillOuterIcon: () => {},
};

export default Filter;
