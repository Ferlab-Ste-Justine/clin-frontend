/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Typography, Card, Tag, Input, Tooltip, Icon, Popover, Divider
} from 'antd';

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


const { CheckableTag } = Tag;

import { isEqual } from 'lodash';


class Filter extends React.Component {
  constructor() {
    super();
    this.state = {
        visible: null,
        checked: null,
    }
    this.handleClick = this.handleClick.bind(this);
  }

    componentWillMount() {
        const { visible, checkable } = this.props;
        this.setState({
            visible,
            checked: false,
        });
    }

  //setFilter(type, value) {
    // this.setState({ type: operator })
  //}

    handleClick() {

    }

    render() {
        const { editable, checkable, data } = this.props;
        const { visible, checked } = this.state;
        //const Component = checkable ? Tag.CheckableTag : Tag

        return (
            <Tag className='filter'
                 visible={visible}
                 closable
                 onClick={() => this.setState({ checked: !checked })}
                 onClose={() => this.setState({ visible: false })}
                 color={ checked ? 'blue' : '' }
                 >
                <Popover
                    trigger="hover"
                    placement="topLeft"
                    title={(
                        <div style={{ marginTop: 5 }}>
                            <Typography.Text>Study</Typography.Text>
                        </div>
                    )}
                    content={(
                        <div>
                            <Typography.Text>Definition of a study</Typography.Text>
                        </div>
                    )}
                >
                <Icon type="info-circle" />
                </Popover>
                { JSON.stringify(data.value) }
                { editable && (<Icon type="caret-down" />) }
            </Tag>
    );
    }
}

class Operator extends React.Component {
  constructor() {
    super();
      this.state = {
          visible: null
      }
  }

    componentWillMount() {
        const { visible } = this.props;
        this.setState({
            visible
        });
    }

  render() {
    const { editable, data } = this.props;
    const { visible } = this.state;

    return (
        <Tag
            className='operator'
            visible={visible}
        >
          { data.value }
            { editable && (<Icon type="caret-down" />) }
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
            const isVisible = item.options.visible;
            const isEditable = item.options.editable;
            const isCheckable = item.options.checkable;


            if (item.type === 'operator') {
                return <Operator visible={isVisible} editable={isEditable} checkable={isCheckable} data={item.data} />
            } else if (item.type === 'filter') {
                return <Filter visible={isVisible} editable={isEditable} checkable={isCheckable} data={item.data} />
            }
        })}
        </div>
    );
  }
}

export default Query;
