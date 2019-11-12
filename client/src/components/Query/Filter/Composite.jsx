/* eslint-disable */

import React from 'react';
import {
  Typography, Row, Col, Select, InputNumber,
} from 'antd';
import {
  cloneDeep, orderBy, pullAllBy, filter,
} from 'lodash';
import PropTypes from 'prop-types';
import Filter, { FILTER_TYPE_COMPOSITE, FILTER_TYPE_GENERICBOOL } from './index';
import {
  FILTER_COMPARATOR_TYPE_GREATER_THAN, FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL, FILTER_COMPARATOR_TYPE_LOWER_THAN, FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL,
} from './NumericalComparison';


export const EMPTY_COMPOSITE_FILTER_INSTRUCTION = { instructions: [] };
const SCORE_SELECTION = '_score_';


class CompositeFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      draft: null,
    };
    this.getEditor = this.getEditor.bind(this);
    this.getLabel = this.getLabel.bind(this);
    this.getPopoverContent = this.getPopoverContent.bind(this);
    this.getPopoverLegend = this.getPopoverLegend.bind(this);
    this.handleComparatorChange = this.handleComparatorChange.bind(this);
    this.handleQualityChange = this.handleQualityChange.bind(this);
    this.handleScoreChange = this.handleScoreChange.bind(this);

    // @NOTE Initialize Component State
    const { data } = props;
    this.state.draft = cloneDeep(data);
  }

  getLabel() {
    const { data } = this.props;
    const { values } = data;
    return JSON.stringify(values);
  }

  getPopoverLegend() {
    const { data } = this.props;
    const { comparator } = data;
    return (
      <span>
        {comparator}
        {' '}
        {data.value}
      </span>
    );
  }

  getPopoverContent() {
    const { intl, data, category } = this.props;
    const { Text } = Typography;
    const titleText = intl.formatMessage({ id: `screen.patientvariant.filter_${data.id}` });
    const descriptionText = intl.formatMessage({ id: `screen.patientvariant.filter_${data.id}.description` });
    const categoryText = category ? intl.formatMessage({ id: `screen.patientvariant.category_${category}` }) : null;

    return (
      <div>
        <Row type="flex" justify="space-between" gutter={32}>
          <Col>
            <Text strong>{titleText}</Text>
          </Col>
          <Col>
            <Text>{categoryText}</Text>
          </Col>
        </Row>
        <Row>
          <Col>
            <Text>{descriptionText}</Text>
          </Col>
        </Row>
        <br />
        <Row>
          <Col>
            <Text>
              {data.comparator}
              {' '}
              {data.value}
            </Text>
          </Col>
        </Row>
      </div>
    );
  }

  handleQualityChange(quality) {
    const { draft } = this.state;
    const clone = cloneDeep(draft)

    if (quality !== SCORE_SELECTION) {
      delete clone.comparator;
    } else if (!clone.comparator) {
      clone.comparator = FILTER_COMPARATOR_TYPE_GREATER_THAN
      quality = 0
    }

    clone.value = quality;
    this.setState({ draft: clone });
  }

  handleComparatorChange(comparator) {
    const { draft } = this.state;
    const clone = cloneDeep(draft)

    clone.comparator = comparator;
    this.setState({ draft: clone });
  }

  handleScoreChange(score) {
    const { draft } = this.state;
    const clone = cloneDeep(draft)

    clone.value = score;
    this.setState({ draft: clone });
  }

  getEditor() {
    const { intl, data, dataSet } = this.props;
    const { draft } = this.state;
    const { comparator, value } = draft;
    const typeGt = intl.formatMessage({ id: 'screen.patientvariant.filter.comparator.gt' });
    const typeGte = intl.formatMessage({ id: 'screen.patientvariant.filter.comparator.gte' });
    const typeLt = intl.formatMessage({ id: 'screen.patientvariant.filter.comparator.lt' });
    const typeLte = intl.formatMessage({ id: 'screen.patientvariant.filter.comparator.lte' });

    return (
      <>
        <Row type="flex" align="middle">
          <Col>
            {data.id}
          </Col>
          <Col>
            <Select value={(!comparator ? value : SCORE_SELECTION)} size="small" type="primary" onChange={this.handleQualityChange}>
              <Option value={SCORE_SELECTION}>Score</Option>
              { dataSet.map(datum => (
                <Option value={datum.value}>{datum.value} [ {datum.count} ]</Option>
              )) }
            </Select>
          </Col>
          <Col>
            <Select disabled={!comparator} value={(comparator ? comparator || FILTER_COMPARATOR_TYPE_GREATER_THAN : '')} size="small" type="primary" onChange={this.handleComparatorChange}>
              <Option value={FILTER_COMPARATOR_TYPE_GREATER_THAN}>{typeGt}</Option>
              <Option value={FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL}>{typeGte}</Option>
              <Option value={FILTER_COMPARATOR_TYPE_LOWER_THAN}>{typeLt}</Option>
              <Option value={FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL}>{typeLte}</Option>
            </Select>
          </Col>
          <Col>
            <InputNumber disabled={!comparator} onChange={this.handleScoreChange} value={(comparator ? value || 0 : '')} step={0.25} />
          </Col>
        </Row>
      </>
    );
  }
  render() {
    return (
      <Filter
        {...this.props}
        type={FILTER_TYPE_COMPOSITE}
        searchable={false}
        editor={this.getEditor()}
        label={this.getLabel()}
        legend={this.getPopoverLegend()}
        content={this.getPopoverContent()}
      />
    );
  }
}
CompositeFilter.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  data: PropTypes.shape({}).isRequired,
  dataSet: PropTypes.array.isRequired,
};
// CompositeFilter.defaultProps = {};
export default CompositeFilter;