/* eslint-disable react/no-unused-state */
import React from 'react';

// import { Icon } from 'react-icons-kit';
// import { ic_refresh } from 'react-icons-kit/md/ic_refresh';

import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types';
import NumericalComparisonWidget from './widgets/NumericalComparisonWidget';
import Filter, { FILTER_TYPE_NUMERICAL_COMPARISON } from './index';

import {
  FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL,
  FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL,
} from '../Operator';

const roundDown2 = value => Math.floor(100 * value) / 100.0;

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
      currentLow: -1,
      currentHigh: -1,
      lowValueSet: false,
      highValueSet: false,
    };
    this.getEditor = this.getEditor.bind(this);
    this.getEditorLabels = this.getEditorLabels.bind(this);
    this.getEditorDraftInstruction = this.getEditorDraftInstruction.bind(this);
    this.getEditorInstruction = this.getEditorInstruction.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.updateDraft = this.updateDraft.bind(this);

    // @NOTE Initialize Component State
    const { data } = props;
    this.state.draft = cloneDeep(data);
  }

  getEditorDraftInstruction() {
    const { draft } = this.state;
    const { id, values } = draft;

    return NumericalComparisonFilter.structFromArgs(id, values);
  }

  getEditorInstruction() {
    const { data } = this.props;
    const { id, values } = data;

    return NumericalComparisonFilter.structFromArgs(id, values);
  }

  getEditorLabels() {
    const { data } = this.props;
    return {
      action: data.values[0].comparator,
      targets: [data.values[0].value],
    };
  }

  getEditor() {
    const {
      draft,
    } = this.state;

    const { data, facets } = this.props;

    const min = roundDown2(facets[`${data.id}_min`][0].value);
    const max = roundDown2(facets[`${data.id}_max`][0].value);

    return {
      getLabels: this.getEditorLabels,
      getDraftInstruction: this.getEditorDraftInstruction,
      getInstruction: this.getEditorInstruction,
      contents: draft && draft.values && draft.values.length > 1 ? (
        <NumericalComparisonWidget
          facets={facets}
          min={min}
          max={max}
          draft={draft}
          updateDraft={this.updateDraft}
          savedData={data}
          rounding={roundDown2}
        />
      ) : null,
    };
  }

  handleReset() {
    const { draft } = this.state;
    console.log('handleReset - old draft: ', draft);

    const { data } = this.props;
    const newDraft = { ...draft };

    newDraft.values[0].value = data.values[0].value;
    newDraft.values[1].value = data.values[1].value;

    console.log('handleReset - new draft: ', newDraft);

    this.setState({ draft: newDraft });
  }

  updateDraft(draft) {
    console.log('updateDraft ...');
    this.setState({ ...draft });
  }

  render() {
    const {
      draft,
    } = this.state;

    return (
      <Filter
        {...this.props}
        draft={draft}
        type={FILTER_TYPE_NUMERICAL_COMPARISON}
        editor={this.getEditor()}
        resettable
        onReset={this.handleReset}
      />
    );
  }
}

NumericalComparisonFilter.propTypes = {
  data: PropTypes.shape({}).isRequired,
  facets: PropTypes.shape({}).isRequired,
};

export default NumericalComparisonFilter;
