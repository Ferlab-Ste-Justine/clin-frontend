/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Tag, Menu, Dropdown, Icon,
} from 'antd';

class Subquery extends React.Component {
  constructor() {
    super();
    this.state = {
      data: null,
      options: {
        editable: null,
      },
      visible: null,
    };
  }

  componentWillMount() {
    const { options, data } = this.props;
    this.setState({
      data,
      options,
      visible: true,
    });
  }

  render() {
    const { data, options, visible } = this.state;
    const { editable } = options;

    return (
      <Tag
        className="subquery"
        visible={visible}
      >
        [ SUBQUERY ]
      </Tag>
    );
  }
}

Subquery.propTypes = {
  data: PropTypes.shape({}).isRequired,
  options: PropTypes.shape({}),
};

Subquery.defaultProps = {
  options: {
    editable: false,
  },
};

export default Subquery;
