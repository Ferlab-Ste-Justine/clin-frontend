import React from 'react';
import {
  Row, Col, Select, InputNumber,
} from 'antd';
import {
  cloneDeep,
} from 'lodash';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';

import Filter, { FILTER_TYPE_COMPOSITE } from './index';
import {
  FILTER_COMPARATOR_TYPE_GREATER_THAN,
  FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL,
  FILTER_COMPARATOR_TYPE_LOWER_THAN,
  FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL,
} from './NumericalComparison';


const SCORE_SELECTION = '_score_';

class CompositeFilter extends React.Component {
  /* @NOTE SQON Struct Sample
  {
      type: 'composite,
      data: {
          value: 'T'
      }
  }
  */
  static qualityCompositionStructFromArgs(value) {
    return { value };
  }

  /* @NOTE SQON Struct Sample
  {
      type: 'composite,
      data: {
          comparator: '<='
          value: '0'
      }
  }
  */
  static numericalCompositionStructFromArgs(comparator, value) {
    return {
      comparator,
      value,
    };
  }

  static structFromArgs(id, composition = {}) {
    return {
      id,
      type: FILTER_TYPE_COMPOSITE,
      ...composition,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      draft: null,
    };
    this.getEditor = this.getEditor.bind(this);
    this.getEditorLabels = this.getEditorLabels.bind(this);
    this.getEditorDraftInstruction = this.getEditorDraftInstruction.bind(this);
    this.getEditorInstruction = this.getEditorInstruction.bind(this);
    this.handleComparatorChange = this.handleComparatorChange.bind(this);
    this.handleQualityChange = this.handleQualityChange.bind(this);
    this.handleScoreChange = this.handleScoreChange.bind(this);

    // @NOTE Initialize Component State
    const { data } = props;
    this.state.draft = cloneDeep(data);
  }

  getEditor() {
    const { data, dataSet } = this.props;
    const { draft } = this.state;
    const { comparator, value } = draft;
    const typeGt = intl.get('screen.patientvariant.filter.comparator.gt');
    const typeGte = intl.get('screen.patientvariant.filter.comparator.gte');
    const typeLt = intl.get('screen.patientvariant.filter.comparator.lt');
    const typeLte = intl.get('screen.patientvariant.filter.comparator.lte');

    return {
      getLabels: this.getEditorLabels,
      getDraftInstruction: this.getEditorDraftInstruction,
      getInstruction: this.getEditorInstruction,
      contents: (
        <>
          <Row type="flex" align="middle">
            <Col>
              {data.id}
            </Col>
            <Col>
              <Select
                type="primary"
                size="small"
                value={(!comparator ? value : SCORE_SELECTION)}
                onChange={this.handleQualityChange}
              >
                <Select.Option value={SCORE_SELECTION}>Score</Select.Option>
                { dataSet.map(datum => (
                  <Select.Option value={datum.value}>
                    {`${datum.value} [ ${datum.count} ]`}
                  </Select.Option>
                )) }
              </Select>
            </Col>
            <Col>
              <Select
                type="primary"
                size="small"
                disabled={!comparator}
                value={(comparator ? comparator || FILTER_COMPARATOR_TYPE_GREATER_THAN : '')}
                onChange={this.handleComparatorChange}
              >
                <Select.Option value={FILTER_COMPARATOR_TYPE_GREATER_THAN}>{typeGt}</Select.Option>
                <Select.Option value={FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL}>{typeGte}</Select.Option>
                <Select.Option value={FILTER_COMPARATOR_TYPE_LOWER_THAN}>{typeLt}</Select.Option>
                <Select.Option value={FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL}>{typeLte}</Select.Option>
              </Select>
            </Col>
            <Col>
              <InputNumber
                step={1}
                disabled={!comparator}
                onChange={this.handleScoreChange}
                value={(comparator ? value || 0 : '')}
              />
            </Col>
          </Row>
        </>
      ),
    };
  }

  getEditorDraftInstruction() {
    const { draft } = this.state;
    const { id, comparator, value } = draft;
    const composition = comparator
      ? CompositeFilter.numericalCompositionStructFromArgs(comparator, value)
      : CompositeFilter.qualityCompositionStructFromArgs(value);

    return CompositeFilter.structFromArgs(id, composition);
  }

  getEditorInstruction() {
    const { data } = this.props;
    const { id, comparator, value } = data;
    const composition = comparator
      ? CompositeFilter.numericalCompositionStructFromArgs(comparator, value)
      : CompositeFilter.qualityCompositionStructFromArgs(value);

    return CompositeFilter.structFromArgs(id, composition);
  }

  getEditorLabels() {
    const { data } = this.props;
    return {
      action: data.comparator,
      targets: [data.value],
    };
  }

  handleComparatorChange(comparator) {
    const { draft } = this.state;
    const clone = cloneDeep(draft);

    clone.comparator = comparator;
    this.setState({ draft: clone });
  }

  handleScoreChange(score) {
    const { draft } = this.state;
    const clone = cloneDeep(draft);

    clone.value = score;
    this.setState({ draft: clone });
  }

  handleQualityChange(quality) {
    const { draft } = this.state;
    const clone = cloneDeep(draft);

    if (quality !== SCORE_SELECTION) {
      delete clone.comparator;
    } else if (!clone.comparator) {
      clone.comparator = FILTER_COMPARATOR_TYPE_GREATER_THAN;
      quality = 0;
    }

    clone.value = quality;
    this.setState({ draft: clone });
  }

  render() {
    const {
      draft,
    } = this.state;

    return (
      <Filter
        {...this.props}
        draft={draft}
        type={FILTER_TYPE_COMPOSITE}
        editor={this.getEditor()}
      />
    );
  }
}
CompositeFilter.propTypes = {
  data: PropTypes.shape({}).isRequired,
  dataSet: PropTypes.array.isRequired,
};

export default CompositeFilter;
