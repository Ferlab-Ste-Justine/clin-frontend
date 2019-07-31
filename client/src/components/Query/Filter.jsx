/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Typography, Card, Tag, Input, Tooltip, Popover, Divider, Menu, Dropdown, Button, Radio, Icon, Checkbox,
} from 'antd';

import IconKit from 'react-icons-kit';
import { empty, one, full, info } from 'react-icons-kit/entypo';
import Operator from "./Operator";

// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';




export const FILTER_TYPE_GENERIC = 'generic';
export const FILTER_TYPE_SPECIFIC = 'specific';
export const FILTER_OPERATOR_TYPE_ALL = 'all';
export const FILTER_OPERATOR_TYPE_ONE = 'one';
export const FILTER_OPERATOR_TYPE_NONE = 'none';

const createPopoverByFilterType = ({ options, data }) => {
    const { type } = data;
    let content = null;
    let legend = null;

    switch(type) {
        case FILTER_TYPE_GENERIC:
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
            switch(operator) {
                case FILTER_OPERATOR_TYPE_ALL:
                    legend = (<IconKit size={16} icon={full}/>)
                    break;
                case FILTER_OPERATOR_TYPE_ONE:
                    legend = (<IconKit size={16} icon={one}/>)
                    break;
                case FILTER_OPERATOR_TYPE_NONE:
                    legend = (<IconKit size={16} icon={empty}/>)
                    break;
            }
            break;

        case FILTER_TYPE_SPECIFIC:
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
    const operator = data.operator;
    const type = data.type;

    switch(type) {
        case 'generic':

            const handleFilterSelection = (e) => {
                const { editable } = this.props;
                if (editable) {
                    this.setState({filters: e.target.value})
                }
            }

            const handleOperatorSelection = (e) => {
                const { editable } = this.props;
                if (editable) {
                    this.setState({operand: e.target.value})
                }
            }

            const handleFilterSearch = (value) => {
                console.log('handleFilterSearch ' + value)
            }


            return (<>
                <Row>
                    <Col span={24}>
                        <Radio.Group size="small" type="primary" value={operator} onChange={handleOperatorSelection}>
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
                        onSearch={handleFilterSearch}
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
                            onChange={handleFilterSelection}
                        />
                    </Col>
                 </Row>
            </>);

        case 'specific':
        default:
            return null
    }

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
    this.handleTagClose = this.handleTagClose.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.createMenuComponent = this.createMenuComponent.bind(this);
    this.createPopoverComponent = this.createPopoverComponent.bind(this);
    this.handleMenuSelection = this.handleMenuSelection.bind(this);
    this.handleApply = this.handleApply.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
  }

    componentWillMount() {
        const { options, data } = this.props;
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
            data,
            options: {
                selectable: options.selectable,
                editable: options.editable,
            },
            visible: true,
            selected: false,
            opened: false,
        });
    }

    handleTagClose() {
        const { editable } = this.state.options;
        const { removalCallback } = this.props;
        if (editable) {
            this.setState({
                opened: false,
                visible: false,
            })
            const tag = Object.assign({}, this.props, this.state);
            removalCallback(tag);
        }
    }

    handleApply() {
        // @NOTE Should be hiding the menu
        // this.toggleMenu()
        const { opened } = this.state;
        if (opened) {
            this.setState({
                opened: false,
            })
        }
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

    toggleMenu(e) {
        const { opened } = this.state;
        this.setState({ opened: !opened })
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
                 onClose={this.handleTagClose}
                 color={ selected ? 'blue' : '' }
                 >
                {popover}
                <span onClick={this.handleSelection}>
                    { JSON.stringify(data.values) }
                </span>
                { editable && (
                    <Dropdown overlay={overlay} visible={opened} placement="bottomCenter">
                        <Icon type="caret-down" onClick={this.toggleMenu} />
                    </Dropdown>
                ) }
            </Tag>
        );
    }
}

Filter.propTypes = {
    data: PropTypes.shape({}).isRequired,
    options: PropTypes.shape({}),
    removalCallback: PropTypes.func,
};

Filter.defaultProps = {
    options: {
        selectable: false,
        editable: false,
    },
    removalCallback: () => {},
};

export default Filter;
