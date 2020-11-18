import React from 'react';
import {
  Row, Col, Checkbox, Tooltip,
} from 'antd';
import {
  cloneDeep, pull, pullAllBy, filter, pullAll, orderBy,
} from 'lodash';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import Filter, {
  FILTER_TYPE_AUTOCOMPLETE,
  FILTER_OPERAND_TYPE_ONE,
} from './index';
import styleFilter from '../styles/filter.module.scss';

class AutocompleteFilter extends React.Component {
  /* @NOTE SQON Struct Sample
    {
        type: 'autocomplete',
        data: {
            id: 'gene_symbol',
            subtype: {
                type: 'generic',
                operand: 'one'
            }
            query: 'BRA',s
            matches: ['BRAA', 'BRAF', 'BRAZ']
            selection: ['BRAF'],
        }
    }
  */
  static structFromArgs(id, subtype, query, matches, selection = []) {
    return {
      id,
      type: FILTER_TYPE_AUTOCOMPLETE,
      subtype: {
        type: subtype,
      },
      query,
      matches,
      selection,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      draft: null,
      selection: [],
      allOptions: null,
    };
    this.getEditor = this.getEditor.bind(this);
    this.getEditorLabels = this.getEditorLabels.bind(this);
    this.getEditorDraftInstruction = this.getEditorDraftInstruction.bind(this);
    this.getEditorInstruction = this.getEditorInstruction.bind(this);
    this.handleSearchByQuery = this.handleSearchByQuery.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.handleSelectNone = this.handleSelectNone.bind(this);
    this.handleSelectAll = this.handleSelectAll.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);

    // @NOTE Initialize Component State
    const { data, dataSet } = props;
    this.state.draft = cloneDeep(data);
    this.state.selection = data.values ? cloneDeep(data.selection) : [];
    this.state.page = 1;
    this.state.size = 10;
    this.state.allOptions = cloneDeep(dataSet);
    this.state.selection = cloneDeep(dataSet);
    const { selection, allOptions } = this.state;
    if (selection.length > 0) {
      const value = filter(cloneDeep(dataSet), o => selection.includes(o));
      if (value.length === 0) {
        const selectedValue = [];
        selection.map(x => selectedValue.push({ value: x }));
        allOptions.unshift(...selectedValue);
      } else {
        const sorted = orderBy(value, ['count'], ['desc']);
        pullAllBy(allOptions, cloneDeep(sorted), 'value');
        allOptions.unshift(...sorted);
      }
    }
  }

  getEditor() {
    const {
      selection, size, page, allOptions,
    } = this.state;

    const minValue = size * (page - 1);
    const maxValue = size * page;
    pullAllBy(allOptions, [{ selection: '' }], 'selection');
    allOptions.sort();
    const options = allOptions.slice(minValue, maxValue).map((option) => {
      const value = option.length < 30 ? option : `${option.substring(0, 25)} ...`;
      return {
        label: (
          <span className={styleFilter.checkboxValue}>
            <Tooltip title={option}>
              { value }
            </Tooltip>
          </span>
        ),
        value: option,
      };
    });

    return {
      getLabels: this.getEditorLabels,
      getDraftInstruction: this.getEditorDraftInstruction,
      getInstruction: this.getEditorInstruction,
      contents: (
        <>
          <Row>
            <Col span={24}>
              <Checkbox.Group onChange={this.handleSelectionChange} option={options.map(option => option.value)} className={`${styleFilter.checkboxGroup} `} value={selection}>
                { options.map(option => (
                  <Row>
                    <Col>
                      <Checkbox className={selection.includes(option.value) ? `${styleFilter.check} ${styleFilter.checkboxLabel}` : `${styleFilter.checkboxLabel}`} value={option.value}>{ option.label }</Checkbox>
                    </Col>
                  </Row>
                )) }
              </Checkbox.Group>
            </Col>
          </Row>
        </>
      ),
    };
  }

  getEditorDraftInstruction() {
    const { draft } = this.state;
    const { id, matches, values } = draft;
    return AutocompleteFilter.structFromArgs(id, 'generic', '', matches, values);
  }

  getEditorInstruction() {
    const { data } = this.props;
    const { id, operand, values } = data;

    return AutocompleteFilter.structFromArgs(id, values, operand);
  }

  getEditorLabels() {
    const { data } = this.props;

    return {
      action: intl.get(`screen.patientvariant.filter.operand.${FILTER_OPERAND_TYPE_ONE}`),
      targets: data.selection,
    };
  }

  handleSearchByQuery(values) {
    const { dataSet } = this.props;
    const allOptions = cloneDeep(dataSet);
    const search = values.toLowerCase();
    const toRemove = filter(cloneDeep(allOptions), o => (search !== '' ? !o.toLowerCase().startsWith(search) : null));
    pullAll(allOptions, toRemove);
    this.setState({
      allOptions,
    });
  }

  handlePageChange(page, size) {
    this.setState({
      page,
      size,
    });
  }

  handleSelectNone() {
    const { draft } = this.state;
    draft.values = [];
    this.setState({
      selection: [],
      draft,
    });
  }

  handleSelectAll() {
    const { draft } = this.state;
    const { dataSet } = this.props;
    const selection = dataSet.map(option => option.value);
    draft.values = selection;
    this.setState({
      selection,
      draft,
    });
  }

  handleSelectionChange(values) {
    const {
      selection, allOptions, page, size, draft,
    } = this.state;

    const minValue = size * (page - 1);
    const maxValue = size * page;
    const options = allOptions.slice(minValue, maxValue);

    options.forEach((x) => {
      if (selection.includes(x)) {
        if (!values.includes(x)) {
          pull(selection, x);
        }
      } else if (values.includes(x)) {
        selection.push(x);
      }
    });

    draft.values = selection;
    this.setState({
      selection,
      draft,
    });
  }

  render() {
    const { allOptions, draft } = this.state;

    return (
      <Filter
        {...this.props}
        draft={draft}
        type={FILTER_TYPE_AUTOCOMPLETE}
        editor={this.getEditor()}
        searchable
        onSearchCallback={this.handleSearchByQuery}
        onPageChangeCallBack={this.handlePageChange}
        onOperandChangeCallBack={this.handleOperandChange}
        sortData={allOptions}
      />
    );
  }
}

AutocompleteFilter.propTypes = {
  data: PropTypes.shape({}).isRequired,
  dataSet: PropTypes.array.isRequired,
  category: PropTypes.string,
};

AutocompleteFilter.defaultProps = {
  category: '',
};

export default AutocompleteFilter;
