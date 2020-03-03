/* eslint-disable react/no-unused-state */
import React from 'react';

// import { Icon } from 'react-icons-kit';
// import { ic_refresh } from 'react-icons-kit/md/ic_refresh';

import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types';
import NumericalComparisonWidget from './widgets/NumericalComparisonWidget';
import Filter, { FILTER_TYPE_NUMERICAL_COMPARISON } from './index';
import Interval from './widgets/Interval';

import {
  FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL,
  FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL,
  OPERATOR_TYPE_ELEMENT_OF,
  IconForOperator,
} from '../Operator';

import { roundDown, roundUp } from '../helpers/rounding';

const VALUE_DECIMALS = 2;

class NumericalComparisonFilter extends React.Component {
  /* @NOTE SQON Struct Sample
  {
    type: 'numcomparison,
    data: {
        id: 'phylop'
        values: [
            {
                comparator: '<',
                value: 10
            }
            {
                comparator: '>=',
                value: 0
            }
        ]
    }
  }
  */
  static structFromArgs(id, values = [
    { comparator: FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL, value: 0 },
    { comparator: FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL, value: 0 },
  ]) {
    return {
      id,
      type: FILTER_TYPE_NUMERICAL_COMPARISON,
      values,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      draft: null,
      sliderDisabled: false,
      inputDisabled: false,
    };
    this.getEditor = this.getEditor.bind(this);
    this.getEditorLabels = this.getEditorLabels.bind(this);
    this.getEditorDraftInstruction = this.getEditorDraftInstruction.bind(this);
    this.getEditorInstruction = this.getEditorInstruction.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.updateDraft = this.updateDraft.bind(this);
    this.getPillContent = this.getPillContent.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.getPillOuterIcon = this.getPillOuterIcon.bind(this);
    // @NOTE Initialize Component State
    const { data } = props;
    this.state.draft = cloneDeep(data);
  }

  getEditorDraftInstruction() {
    const { draft } = this.state;
    const { id } = draft;

    const values = draft.values.filter(term => !term.markedForDeletion);

    return {
      id,
      type: FILTER_TYPE_NUMERICAL_COMPARISON,
      values,
    };
  }

  getEditorInstruction() {
    const { data } = this.props;
    const { id, values } = data;

    const trimmedValues = values.filter(v => !v.markedForDeletion);
    return {
      id,
      type: FILTER_TYPE_NUMERICAL_COMPARISON,
      values: trimmedValues,
    };
  }

  getEditorLabels() {
    const { data } = this.props;
    return {
      action: data.values[0].comparator,
      targets: [data.values[0].value],
    };
  }

  getMin() {
    const { data, facets } = this.props;
    const min = roundUp(VALUE_DECIMALS)(facets[`${data.id}_min`][0].value);
    return min;
  }

  getMax() {
    const { data, facets } = this.props;
    const max = roundDown(VALUE_DECIMALS)(facets[`${data.id}_max`][0].value);
    return max;
  }

  getEditor() {
    const {
      draft,
    } = this.state;

    const { data } = this.props;

    return {
      getLabels: this.getEditorLabels,
      getDraftInstruction: this.getEditorDraftInstruction,
      getInstruction: this.getEditorInstruction,
      contents: draft /* && draft.values && draft.values.length > 1 */ ? (
        <NumericalComparisonWidget
          min={this.getMin()}
          max={this.getMax()}
          draft={cloneDeep(draft)}
          savedData={data}
          updateDraft={this.updateDraft}
        />
      ) : null,
    };
  }

  getPillContent() {
    const {
      data,
    } = this.props;

    const { values } = data;

    console.log('getPillContent - values: ', values);

    return (
      <Interval
        terms={values}
      />
    );
  }

  getPillOuterIcon() {
    const { data } = this.props;
    const { values } = data;

    let operator = null;
    switch (values.length) {
      case 1:
        operator = values[0].comparator;
        break;
      case 2:
        operator = OPERATOR_TYPE_ELEMENT_OF;
        break;
      default:
        break;
    }
    return IconForOperator(operator);
  }

  handleReset() {
    const { draft } = this.state;

    const { data } = this.props;
    const newDraft = { ...draft };

    newDraft.values[0].value = data.values[0].value;
    newDraft.values[1].value = data.values[1].value;

    this.setState({ draft: newDraft });
  }

  updateDraft(draft) {
    this.setState({ draft });
  }

  handleFilterChange(filterArg) {
    const {
      draft,
    } = this.state;

    const {
      onEditCallback,
    } = this.props;

    const draftClone = cloneDeep(draft);

    draftClone.values = draftClone.values.filter(term => !term.markedForDeletion);

    if (!draftClone.values.length) return;

    this.setState({ draft: draftClone }, () => {
      onEditCallback(filterArg);
    });
  }

  render() {
    const {
      draft,
    } = this.state;

    const {
      data,
    } = this.props;

    console.log('render - draft: ', draft);
    console.log('render - data: ', data);

    return (
      <Filter
        {...this.props}
        draft={draft}
        onEditCallback-={this.handleFilterChange}
        type={FILTER_TYPE_NUMERICAL_COMPARISON}
        editor={this.getEditor()}
        resettable
        onReset={this.handleReset}
        getPillContent={this.getPillContent}
        getPillOuterIcon={this.getPillOuterIcon}
      />
    );
  }
}

NumericalComparisonFilter.propTypes = {
  onEditCallback: PropTypes.func.isRequired,
  data: PropTypes.shape({}).isRequired,
  facets: PropTypes.shape({}).isRequired,
};

export default NumericalComparisonFilter;
