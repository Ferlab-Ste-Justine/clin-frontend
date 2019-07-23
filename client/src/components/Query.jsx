/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Typography, Card, Tag, Input, Tooltip, Popover, Divider, Icon, Menu, Dropdown, Button, Radio, Checkbox,
} from 'antd';

import { Icon as IconKit } from 'react-icons-kit'
import { empty, one, full, info } from 'react-icons-kit/entypo'

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


const { CheckableTag } = Tag;

import { isEqual } from 'lodash';



const createPopoverByFilterType = ({ type, options, data }) => {
    let content = null;
    let legend = null;

    switch(type) {
        case 'generic':
            const operator = data.operator;
            content = (
                <div>
                    <Typography.Text>FILTER is OPERATOR</Typography.Text>
                    <ul>
                        <li>VALUE 1</li>
                        <li>VALUE 3</li>
                    </ul>
                </div>
            )
            if (operator === 'all') {
                legend = (<IconKit size={16} icon={empty}/>)
            } else if (operator === 'one') {
                legend = (<IconKit size={16} icon={one}/>)
            } else {
                legend = (<IconKit size={16} icon={empty}/>)
            }
            break;

        case 'specific':
        default:
            legend = (<IconKit size={16} icon={info}/>)
            break;
    }

    return (
        <Popover
            trigger="hover"
            placement="topLeft"
            content={content}
        >
            {legend}&nbsp;
        </Popover>
    )
}

const createMenuByFilterType = ({ options, data }) => {

    /*
    const type = data.type;

    switch(type) {
        case 'generic':
            const aaa = () => {}



            return (
                <Row>HELLO</Row>
            );

        case 'specific':
        default:
            return null
    }
*/
    return null;


    /*
    <Row>
                        <Col span={24}>
                <Radio.Group size="small" type="primary" value={operator} onChange={this.handleOperandSelection}>
                    <Radio.Button style={{ width: 150, textAlign: 'center' }} value="all">All Of</Radio.Button>
                    <Radio.Button style={{ width: 150, textAlign: 'center' }} value="one">At Least One</Radio.Button>
                    <Radio.Button style={{ width: 150, textAlign: 'center' }} value="not">Not Any Of</Radio.Button>
                </Radio.Group>
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Input.Search
                            placeholder="Recherche"
                            size="small"
                            onSearch={value => console.log(value)}
                        />
                    </Row>
                    <br />

                    <Row>
                        Effacer | Tout Selectionner
                    </Row>
                    <br />

                    <Row>
                        <Col span={24}>


                            <Checkbox.Group style={{ display: 'flex', flexDirection: 'column' }}
                                options={['Apple', 'Pear', 'Orange']}
                                value={['Apple']}
                                // onChange={this.onChange}
                            />


                        </Col>
                    </Row>
                    <br />



                        /*
    handleFilterSelection(e) {
        const { editable } = this.props;
        if (editable) {
            this.setState({filters: e.target.value})
        }
    }

    handleOperandSelection(e) {
        const { editable } = this.props;
        if (editable) {
            this.setState({operand: e.target.value})
        }
    }
    */

}

class Filter extends React.Component {
  constructor() {
    super();
    this.state = {
        type: null,
        options: {
            editable: null,
            selectable: null,
        },
        data: {},
        visible: null,
        selected: null,
        opened: null,
    }
    this.handleClose = this.handleClose.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.createMenuComponent = this.createMenuComponent.bind(this);
    this.createPopoverComponent = this.createPopoverComponent.bind(this);
    this.handleMenuSelection = this.handleMenuSelection.bind(this);
    this.handleApply = this.handleApply.bind(this);
    this.showMenu = this.showMenu.bind(this);
    this.hideMenu = this.hideMenu.bind(this);
  }

    componentWillMount() {
        const { options, data } = this.props;

        console.log('==========')
        console.log(this.props)

        switch(data.type) {
            case 'generic':
                if (!data.operator) {
                    data.operator = 'all';
                }
                if (!data.values) {
                    data.values = [];
                }
                break;
            case 'specific':
            default:
                break;
        }

        this.setState({
            type: data.type || 'generic',
            options: {
                selectable: options.selectable || false,
                editable: options.editable || false,
            },
            data,
            visible: true,
            selected: false,
            opened: false,
        });
    }

    handleClose() {
        const { editable } = this.state.options;
        const { opened } = this.state;
        if (editable && !opened ) {
            this.setState({
                opened: false,
            })
        }
    }

    handleApply() {
        this.hideMenu()
    }

    handleSelect(e) {
        const { selectable } = this.state.options;
        const { opened, selected } = this.state;
        if (selectable && !opened) {
            const { selected } = this.state.options;
            this.setState({selected: !selected})
        }
    }

    createPopoverComponent() {
        return createPopoverByFilterType(this.state)
    }

    createMenuComponent() {
        const { opened, data } = this.state;
        const menu = createMenuByFilterType(this.state);
        return (
            <Popover
                key={`filter-${data.id}`}
                visible={opened}>
                <Card>
                    <Typography.Title level={4}>{data.title}</Typography.Title>
                    { menu }
                    <Row type="flex" justify="end">
                        <Col span={6}>
                            <Button onClick={this.hideMenu}>Annuler</Button>
                        </Col>
                        <Col span={5}>
                            <Button type="primary" onClick={this.handleApply}>Appliquer</Button>
                        </Col>

                    </Row>
                </Card>
            </Popover>
        );
    }

    showMenu(e) {
        this.setState({ opened: true })
    }

    hideMenu(e) {
        this.setState({ opened: false })
    }

    handleMenuSelection(e) {
        e.preventDefault()
    }

    render() {
        const { data, options, visible, selected, opened } = this.state;
        const popover = this.createPopoverComponent();
        const overlay = this.createMenuComponent();
        const editable = options.editable;

        return (
            <Tag className='filter'
                 visible={visible}
                 closable={editable}
                 onClose={this.handleClose}
                 color={ selected ? 'blue' : '' }
                 >
                {popover}
                <span onClick={this.handleSelection}>
                    { JSON.stringify(data.values) }
                </span>
                { editable && (
                    <Dropdown overlay={overlay} visible={opened} placement="bottomCenter">
                        <Icon type="caret-down" onClick={this.showMenu} />
                    </Dropdown>
                ) }
            </Tag>
    );
    }
}

class Operator extends React.Component {
  constructor() {
    super();
      this.state = {
          options: {
              editable: null,
          },
          data: null,
          visible: null
      }
      this.createMenuComponent = this.createMenuComponent.bind(this);
      this.handleMenuSelection = this.handleMenuSelection.bind(this);
  }

    componentWillMount() {
        this.setState({
            visible: true
        });
    }

    handleMenuSelection({ key }) {

    }

    // this.handleMenuSelection
    createMenuComponent() {
        return (
            <Menu onClick={() => {}}>
                <Menu.Item key="and">
                    AND
                </Menu.Item>
                <Menu.Item key="or">
                   OR
                </Menu.Item>
            </Menu>
        );
    }

  render() {
    const { options, data } = this.state;
    const editable = options.editable;

    return (
        <Tag
            className='operator'
            visible={this.state.visible}
        >
            { data.type }
            { editable && (
                <Dropdown overlay={this.createMenuComponent} trigger={['click']} placement="bottomRight">
                    <a className="ant-dropdown-link" href="#">
                        <Icon type="caret-down" />
                    </a>
                </Dropdown>
            ) }
        </Tag>
    );
  }
}

// filter out loose first, loose last and double following operators

class Query extends React.Component {
  constructor() {
    super();
    this.state = {
      data: null
    };
  }

  componentWillMount() {
      const { data } = this.props;
      this.setState({
          data
      });
  }

    render() {
      const initial = this.props.data;
      const current = this.state.data;
      const isDirty = !isEqual(current, initial);

    return (
        <div className='query' style={{ border: `1px ${isDirty ? 'dashed #085798' : 'solid #CCCCCC'}`, display: 'inline-flex', padding: '5px 8px 4px 8px', marginBottom: 5 }}>
        { current.map((item, index) => {
            if (item.type === 'operator') {
                return <Operator options={item.options} data={item.data} />
            } else if (item.type === 'filter') {
                return <Filter options={item.options} data={item.data} />
            }
        })}
        </div>
    );
  }
}

export default Query;
