/* eslint-disable */


/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, no-case-declarations */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Typography, Card, Tag, Input, Popover, Dropdown, Button, Radio, Icon, Checkbox,
} from 'antd';
import { cloneDeep } from 'lodash';
import IconKit from 'react-icons-kit';
import {
  empty, one, full, info,
} from 'react-icons-kit/entypo';

export const INSTRUCTION_TYPE_FILTER = 'filter';
export const FILTER_TYPE_GENERIC = 'generic';
export const FILTER_TYPE_SPECIFIC = 'specific';
export const FILTER_OPERAND_TYPE_ALL = 'all';
export const FILTER_OPERAND_TYPE_ONE = 'one';
export const FILTER_OPERAND_TYPE_NONE = 'none';
export const FILTER_TYPES = [FILTER_TYPE_GENERIC, FILTER_TYPE_SPECIFIC];
// const FILTER_OPERANDS = [FILTER_OPERAND_TYPE_ALL, FILTER_OPERAND_TYPE_ONE, FILTER_OPERAND_TYPE_NONE];

export const createFilter = type => ({
  type: INSTRUCTION_TYPE_FILTER,
  data: {
    type: (FILTER_TYPES.indexOf(type) !== -1 ? type : FILTER_TYPE_GENERIC),
  },
});




const createPopoverByFilterType = (data) => {
  const { type, operand } = data;
  let content = null;
  let legend = null;

  switch (type) {
    case FILTER_TYPE_GENERIC:
      content = (
        <div>
          <Typography.Text>{operand}</Typography.Text>
          <ul>
            <li>VALUE 1</li>
            <li>VALUE 3</li>
          </ul>
        </div>
      );
      switch (operand) {
        default:
        case FILTER_OPERAND_TYPE_ALL:
          legend = (<IconKit size={16} icon={full} />);
          break;
        case FILTER_OPERAND_TYPE_ONE:
          legend = (<IconKit size={16} icon={one} />);
          break;
        case FILTER_OPERAND_TYPE_NONE:
          legend = (<IconKit size={16} icon={empty} />);
          break;
      }
      break;

    case FILTER_TYPE_SPECIFIC:
    default:
      legend = (<IconKit size={16} icon={info} />);
      break;
  }

  return (
    <Popover
      className="legend"
      trigger="hover"
      placement="topLeft"
      content={content}
    >
      {legend}
    </Popover>
  );
};

class Filter extends React.Component {
  constructor() {
    super();
    this.state = {
      type: null,
      data: null,
      draft: null,
      visible: null,
      selected: null,
      opened: null,
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
    this.createMenuComponent = this.createMenuComponent.bind(this);
    this.createPopoverComponent = this.createPopoverComponent.bind(this);
    this.createSubMenuByFilterType = this.createSubMenuByFilterType.bind(this);
    this.handleApply = this.handleApply.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  /* eslint-disable */
  componentDidMount() {
    const {
      data, autoOpen, visible,
    } = this.props;
    switch (data.type) {
      default:
      case FILTER_TYPE_GENERIC:
        if (!data.operand) {
          data.operand = FILTER_OPERAND_TYPE_ALL;
        }
        if (!data.values) {
          data.values = [];
        }
        break;
      case FILTER_TYPE_SPECIFIC:
        break;
    }

    this.setState({
      data,
      draft: cloneDeep(data),
      opened: autoOpen,
      selected: false,
      visible,
    });
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

  handleClose() {
    if (this.isRemovable()) {
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
      const { onEditCallback } = this.props;
      this.setState({
        data: { ...draft },
        opened: false,
      }, () => { onEditCallback(this.serialize()); });
    }
  }

  handleCancel() {
    const { data } = this.state;
    const { onCancelCallback } = this.props;
    this.setState({
      draft: { ...data },
      opened: false,
    }, () => { onCancelCallback(this.serialize()); });
  }

  handleSelect() {
    if (this.isSelectable() && !this.isOpened()) {
      const { onSelectCallback } = this.props;
      this.setState({
        selected: !this.isSelected(),
      }, () => { onSelectCallback(this.serialize()); });
    }
  }

  createPopoverComponent() {
    const { data } = this.state;
    return createPopoverByFilterType(data);
  }

  createSubMenuByFilterType() {
    const { draft } = this.state;
    const { operand, type } = draft;

    switch (type) {
      case 'generic':

        const handleFilterChange = (e) => {
          if (this.isEditable()) {
            this.setState({ filters: e.target.value });
          }
        };

        const handleOperandChange = (e) => {
          if (this.isEditable()) {
            draft.operand = e.target.value;
            this.setState({ draft });
          }
        };

        const handleFilterSearchByQuery = (value) => {
          console.log('+++ handleFilterSearchByQuery');
          console.log(value);
        };

        const handleFilterSelectAll = () => {
          console.log('+++ handleFilterSelectAll');
        };

        const handleFilterEraseAll = () => {
          console.log('+++ handleFilterSelectNone');
        };

        return (
          <>
            <Row>
              <Col span={24}>
                <Radio.Group size="small" type="primary" value={operand} onChange={handleOperandChange}>
                  <Radio.Button style={{ width: 150, textAlign: 'center' }} value={FILTER_OPERAND_TYPE_ALL}>All Of</Radio.Button>
                  <Radio.Button style={{ width: 150, textAlign: 'center' }} value={FILTER_OPERAND_TYPE_ONE}>At Least One</Radio.Button>
                  <Radio.Button style={{ width: 150, textAlign: 'center' }} value={FILTER_OPERAND_TYPE_NONE}>Not Any Of</Radio.Button>
                </Radio.Group>
              </Col>
            </Row>
            <br />
            <Row>
              <Input.Search
                placeholder="Recherche"
                size="small"
                onSearch={handleFilterSearchByQuery}
              />
            </Row>
            <br />
            <Row>
              <span onClick={handleFilterEraseAll}>Aucun</span>
              {' '}
              <span onClick={handleFilterSelectAll}>Tous</span>
            </Row>
            <br />
            <Row>
              <Col span={24}>
                <Checkbox.Group
                  style={{ display: 'flex', flexDirection: 'column' }}
                  options={['Apple', 'Pear', 'Orange']}
                  value={['Apple']}
                  onChange={handleFilterChange}
                />
              </Col>
            </Row>
          </>
        );

      case 'specific':
      default:
        return null;
    }
  }

  createMenuComponent() {
    const { data } = this.state;
    const filterMenu = this.createSubMenuByFilterType();

    return (
      <Popover
        visible={this.isOpened()}
      >
        <Card>
          <Typography.Title level={4}>{data.id}</Typography.Title>
          { filterMenu }
          <Row type="flex" justify="end">
            <Col span={6}>
              <Button onClick={this.handleCancel}>Annuler</Button>
            </Col>
            <Col span={5}>
              <Button type="primary" onClick={this.handleApply}>Appliquer</Button>
            </Col>
          </Row>
        </Card>
      </Popover>
    );
  }

  toggleMenu() {
    this.setState({ opened: !this.isOpened() });
  }

  render() {
    const { draft } = this.state;
    if (draft === null) { return null }

    const { overlayOnly } = this.props;
    const overlay = this.createMenuComponent();

    if (overlayOnly === true) {
      return (<Dropdown
        onVisibleChange={this.toggleMenu} overlay={overlay} visible={this.isOpened()} placement="bottomLeft"><span/>
      </Dropdown>);
    }

    const popover = this.createPopoverComponent();
    return (
      <span>
        <Tag
          className="filter"
          visible={this.isVisible()}
          closable={this.isRemovable()}
          onClose={this.handleClose}
          color={this.isSelected() ? 'blue' : ''}
        >
          {popover}
          <span onClick={this.handleSelect}>
            { JSON.stringify(draft.values) }
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
  data: PropTypes.shape({}).isRequired,
  options: PropTypes.shape({}),
  onEditCallback: PropTypes.func,
  onCancelCallback: PropTypes.func,
  onRemoveCallback: PropTypes.func,
  onSelectCallback: PropTypes.func,
  autoOpen: PropTypes.bool,
  overlayOnly: PropTypes.bool,
  visible: PropTypes.bool,
};

Filter.defaultProps = {
  options: {
    editable: false,
    selectable: false,
    removable: false,
  },
  onEditCallback: () => {},
  onCancelCallback: () => {},
  onRemoveCallback: () => {},
  onSelectCallback: () => {},
  autoOpen: false,
  overlayOnly: false,
  visible: true,
};

export default Filter;
