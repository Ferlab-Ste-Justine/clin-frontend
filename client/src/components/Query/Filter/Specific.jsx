/* eslint-disable */

import React from 'react';
import IconKit from 'react-icons-kit';
import {
    info,
} from 'react-icons-kit/entypo';

import Filter from './index';
import { FILTER_OPERAND_TYPE_ALL, FILTER_OPERAND_TYPE_NONE, FILTER_OPERAND_TYPE_ONE } from './Generic';


class SpecificFilter extends Filter {

    constructor(props) {
        super(props);

        this.getEditor = this.getEditor.bind(this);
        this.getLabel = this.getLabel.bind(this);
        this.getPopoverLegend = this.getPopoverLegend.bind(this);
        this.getPopoverContent = this.getPopoverContent.bind(this);
    }


  getLabel() {
    const { data } = this.props;
    const { values } = data;
    return JSON.stringify(values);
  }

  getPopoverLegend() {
      return (<IconKit size={16} icon={info} />);
  }

  getPopoverContent() {
      return (<div />);
  }

  getEditor() {
    return (<div />);
  }

  render() {
      return this._render();
  }
}

SpecificFilter.propTypes = {
  config: PropTypes.shape({}).isRequired,
};

SpecificFilter.defaultProps = {
  config: {
    operands: [FILTER_OPERAND_TYPE_ALL, FILTER_OPERAND_TYPE_ONE, FILTER_OPERAND_TYPE_NONE]
  },
};

export default SpecificFilter;
