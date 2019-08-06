/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Card, Row, Col, Tag, Dropdown, Button, Icon, Popover, Typography,
} from 'antd';
import IconKit from 'react-icons-kit';
import { chart } from 'react-icons-kit/entypo';

export const SUBQUERY_TYPE_GENERIC = 'generic';


const createPopoverBySubqueryType = (state) => {
  const { data } = state;
  const { type } = data;
  let content = null;
  let legend = null;

  switch (type) {
    case SUBQUERY_TYPE_GENERIC:
    default:
      content = (
        <div>
          <Typography.Text>SUBQUERY is GENERIC</Typography.Text>
        </div>
      );
      legend = (<IconKit size={16} icon={chart} />);
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


class Subquery extends React.Component {
  constructor() {
    super();
    this.state = {
      data: null,
      draft: null,
      visible: null,
      opened: null,
    };
    this.isEditable = this.isEditable.bind(this);
    this.isOpened = this.isOpened.bind(this);
    this.isSelectable = this.isSelectable.bind(this);
    this.isVisible = this.isVisible.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.serialize = this.serialize.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.createPopoverComponent = this.createPopoverComponent.bind(this);
    this.createMenuComponent = this.createMenuComponent.bind(this);
    this.createSubMenuBySubqueryType = this.createSubMenuBySubqueryType.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
    this.handleApply = this.handleApply.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  componentWillMount() {
    const { data } = this.props;
    this.setState({
      data,
      draft: { ...data },
      visible: true,
      opened: false,
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

  handleSelect() {
    if (this.isSelectable()) {
      this.setState({ selected: !this.isSelected() });
    }
  }

  toggleMenu() {
    this.setState({ opened: !this.isOpened() });
  }

  createPopoverComponent() {
    return createPopoverBySubqueryType(this.state);
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
    this.setState({
      draft: { ...data },
      opened: false,
    });
  }

  handleClose() {
    if (this.isEditable()) {
      const { onRemoveCallback } = this.props;
      this.setState({
        opened: false,
        visible: false,
      }, () => { onRemoveCallback(this.serialize()); });
    }
  }

  createSubMenuBySubqueryType() {
    const { draft } = this.state;
    const { type } = draft;

    switch (type) {
      case SUBQUERY_TYPE_GENERIC:
        return (
          <>
            <Row>
              <Col>
              [ TO DO ]
              </Col>
            </Row>
          </>
        );
      default:
        return null;
    }
  }

  createMenuComponent() {
    const { data } = this.state;
    const filterMenu = this.createSubMenuBySubqueryType();

    return (
      <Popover
        key={`filter-${data.id}`}
        visible={this.isOpened()}
      >
        <Card>
          <Typography.Title level={4}>{data.title}</Typography.Title>
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

  render() {
    const popover = this.createPopoverComponent();
    const overlay = this.createMenuComponent();

    return (
      <Tag
        className="subquery"
        visible={this.isVisible()}
        closable={this.isEditable()}
        onClose={this.handleClose}
        color={this.isSelected() ? 'blue' : ''}
      >
        {popover}
        <span onClick={this.handleSelect}>
          { JSON.stringify(['Subquery']) }
        </span>
        { this.isEditable() && (
          <Dropdown overlay={overlay} visible={this.isOpened()} placement="bottomCenter">
            <Icon type="caret-down" onClick={this.toggleMenu} />
          </Dropdown>
        ) }
      </Tag>
    );
  }
}

Subquery.propTypes = {
  data: PropTypes.shape({}).isRequired,
  options: PropTypes.shape({}),
  onEditCallback: PropTypes.func,
  onRemoveCallback: PropTypes.func,
};

Subquery.defaultProps = {
  options: {
    editable: false,
    selectable: false,
  },
  onEditCallback: () => {},
  onRemoveCallback: () => {},
};

export default Subquery;
