/* eslint-disable */

import React from 'react';
import {
    Select, Tooltip, Row, Col, Typography, InputNumber
} from 'antd';
import { cloneDeep, pull , orderBy , pullAllBy , filter} from 'lodash';
import IconKit from 'react-icons-kit';
import {
    empty, one, full,
} from 'react-icons-kit/entypo';

import Filter from './index';


export const FILTER_OPERAND_TYPE_ALL = 'all';
export const FILTER_OPERAND_TYPE_ONE = 'one';
export const FILTER_OPERAND_TYPE_NONE = 'none';

class NumericalFilter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            draft: null,

        };
        this.getEditor = this.getEditor.bind(this);
        this.getLabel = this.getLabel.bind(this);
        this.getPopoverContent = this.getPopoverContent.bind(this);
        this.getPopoverLegend = this.getPopoverLegend.bind(this);
        this.handleComparatorChange = this.handleComparatorChange.bind(this)

        // @NOTE Initialize Component State
        const { data, dataSet } = props;
        this.state.draft = cloneDeep(data);
      }

  getLabel() {
    const { data } = this.props;
    const { values } = data;
    return JSON.stringify(values);
  }

  getPopoverLegend() {
      const { data } = this.props;
      const { operand } = data;
      switch (operand) {
          default:
          case FILTER_OPERAND_TYPE_ALL:
              return (<IconKit size={16} icon={full} />);
          case FILTER_OPERAND_TYPE_ONE:
              return (<IconKit size={16} icon={one} />);
          case FILTER_OPERAND_TYPE_NONE:
              return (<IconKit size={16} icon={empty} />);
      }
  }

  getPopoverContent() {
      const { intl , data , category} = this.props;
      const { Text } = Typography;

      const titleText = intl.formatMessage({ id: 'screen.patientvariant.filter_'+data.id });
      const descriptionText = intl.formatMessage({ id: 'screen.patientvariant.filter_'+data.id+'.description'});
      const operandText = intl.formatMessage({ id: 'screen.patientvariant.filter.operand.'+data.operand });
      const categoryText = intl.formatMessage({ id: 'screen.patientvariant.category_'+category });
      const valueText = intl.formatMessage({ id: 'screen.patientvariant.filter_value'});

      const valueList = data.values ? data.values.map(x => {return <li>{x}</li>}) : null

      return (
          <div>
              <Row type="flex" justify="space-between" gutter={32}>
                  <Col>
                    <Text strong>{titleText}</Text>
                  </Col>
                  <Col>
                    <Text >{categoryText}</Text>
                  </Col>
              </Row>
              <Row>
                  <Col>
                    <Text>{descriptionText}</Text>
                  </Col>
              </Row>
              <br/>
              <Row>
                  <Col>
                    <Text>{operandText}</Text>
                  </Col>
              </Row>
              <br/>
              <Row>
                  <Col>
                    {valueText} :
                  </Col>
              </Row>
              <Row>
                  <Col>
                    <ul>
                        {valueList}
                    </ul>
                  </Col>
              </Row>
          </div>
      );
  }
    handleComparatorChange(){
        console.log("test")
    }

    getEditor() {
      const { Option } = Select;
      return (
          <>
              <Row type="flex" justify="space-between">
                  <Col>
                      comparator
                      <Select defaultValue="<"  onChange={this.handleComparatorChange}>
                        <Option value="<">&#60;</Option>
                        <Option value="<=">&#60;=</Option>
                        <Option value=">">&#62;</Option>
                        <Option value=">=">&#62;=</Option>
                      </Select>
                  </Col>
                  <Col>
                      Value
                      <InputNumber min={0} max={10} step={0.1} onChange={this.handleComparatorChange} />
                  </Col>




              </Row>

          </>
      );
  }
  render() {
      return <Filter
          {...this.props}
          editor={this.getEditor()}
          label={this.getLabel()}
          legend={this.getPopoverLegend()}
          content={this.getPopoverContent()}
      />;
  }

}

// NumericalFilter.propTypes = {};

// NumericalFilter.defaultProps = {};

export default NumericalFilter;