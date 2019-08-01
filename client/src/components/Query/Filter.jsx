/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Typography, Card, Tag, Input, Tooltip, Popover, Divider, Menu, Dropdown, Button, Radio, Icon, Checkbox,
} from 'antd';

import IconKit from 'react-icons-kit';
import { empty, one, full, info } from 'react-icons-kit/entypo';

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
    this.isEditable = this.isEditable.bind(this);
    this.isSelectable = this.isSelectable.bind(this);
    this.isVisible = this.isVisible.bind(this);
    this.isSelected = this.isSelected.bind(this);
    this.isOpened = this.isOpened.bind(this);
    this.serialize = this.serialize.bind(this);
    this.handleTagClose = this.handleTagClose.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.createMenuComponent = this.createMenuComponent.bind(this);
    this.createPopoverComponent = this.createPopoverComponent.bind(this);
    this.createSubMenuByFilterType = this.createSubMenuByFilterType.bind(this);
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

    isEditable() {
        const { options } = this.state;
        const { editable } = options;
        return editable === true;
    }

    isSelectable() {
        const { options } = this.state;
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

    handleTagClose() {
        const { onRemovalCallback } = this.props;
        if (this.isEditable()) {
            this.setState({
                opened: false,
                visible: false,
            })
            onRemovalCallback(this.serialize());
        }
    }

    handleApply() {
        if (this.isOpened()) {
            this.setState({
                opened: false,
            })
        }
    }

    handleSelect(e) {
        if (this.isSelectable() && !this.isOpened()) {
            this.setState({ selected: !this.isSelected() } )
        }
    }

    createPopoverComponent() {
        return createPopoverByFilterType(this.state)
    }

    createSubMenuByFilterType() {
        const { data } = this.state;
        const operator = data.operator;
        const type = data.type;

        switch(type) {
            case 'generic':

                const handleFilterChange = (e) => {
                    console.log('+++ handleFilterSelection')
                    console.log(e)
                    if (this.isEditable()) {
                        this.setState({filters: e.target.value})
                    }
                }

                const handleOperatorChange = (e) => {
                    console.log('+++ handleOperatorChange')
                    console.log(e)
                    if (this.isEditable()) {
                        console.log('HELLO');
                        const { data } = this.state;
                        data.operator = e.target.value
                        this.setState({ data } )
                    }
                }

                const handleFilterSearchByQuery = (value) => {
                    console.log('+++ handleFilterSearchByQuery')
                    console.log(value);
                }

                const handleFilterSelectAll = () => {
                    console.log('+++ handleFilterSelectAll')
                }

                const handleFilterEraseAll = () => {
                    console.log('+++ handleFilterSelectNone')
                }

                return (<>
                    <Row>
                        <Col span={24}>
                            <Radio.Group size="small" type="primary" value={operator} onChange={handleOperatorChange}>
                                <Radio.Button style={{ width: 150, textAlign: 'center' }} value={FILTER_OPERATOR_TYPE_ALL}>All Of</Radio.Button>
                                <Radio.Button style={{ width: 150, textAlign: 'center' }} value={FILTER_OPERATOR_TYPE_ONE}>At Least One</Radio.Button>
                                <Radio.Button style={{ width: 150, textAlign: 'center' }} value={FILTER_OPERATOR_TYPE_NONE}>Not Any Of</Radio.Button>
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
                        <a onClick={handleFilterEraseAll}>Aucun</a> | <a onClick={handleFilterSelectAll}>Tous</a>
                    </Row>
                    <br />
                    <Row>
                        <Col span={24}>
                            <Checkbox.Group style={{ display: 'flex', flexDirection: 'column' }}
                                options={['Apple', 'Pear', 'Orange']}
                                value={['Apple']}
                                onChange={handleFilterChange}
                            />
                        </Col>
                     </Row>
                </>);

            case 'specific':
            default:
                return null
        }
    }

    createMenuComponent() {
        const { data } = this.state;
        const filterMenu = this.createSubMenuByFilterType();

        return (
            <Popover
                key={`filter-${data.id}`}
                visible={this.isOpened()}>
                <Card>
                    <Typography.Title level={4}>{data.title}</Typography.Title>
                    { filterMenu }
                    <Row type="flex" justify="end">
                        <Col span={6}>
                            <Button onClick={this.toggleMenu}>Annuler</Button>
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
        this.setState({ opened: !this.isOpened() })
    }

    handleMenuSelection(e) {
        e.preventDefault()
    }

    render() {
        const { data } = this.state;
        const popover = this.createPopoverComponent();
        const overlay = this.createMenuComponent();

        return (
            <Tag className='filter'
                 visible={this.isVisible()}
                 closable={this.isEditable()}
                 onClose={this.handleTagClose}
                 color={ this.isSelected() ? 'blue' : '' }
            >
                {popover}
                <span onClick={this.handleSelect}>
                    { JSON.stringify(data.values) }
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

Filter.propTypes = {
    data: PropTypes.shape({}).isRequired,
    options: PropTypes.shape({}),
    onRemovalCallback: PropTypes.func,
};

Filter.defaultProps = {
    options: {
        selectable: false,
        editable: false,
    },
    onRemovalCallback: () => {},
};

export default Filter;
