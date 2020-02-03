import React from 'react';
import {
  Row, Col, Checkbox, Radio, Tag, Tooltip,
} from 'antd';
import {
  cloneDeep, pull, orderBy, pullAllBy, filter,
} from 'lodash';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import Filter, { FILTER_TYPE_GENERIC } from './index';

export const FILTER_OPERAND_TYPE_ALL = 'all';
export const FILTER_OPERAND_TYPE_ONE = 'one';
export const FILTER_OPERAND_TYPE_NONE = 'none';
export const FILTER_OPERAND_TYPE_DEFAULT = FILTER_OPERAND_TYPE_ONE;


class GenericFilter extends React.Component {
  /* @NOTE SQON Struct Sample
  {
      type: 'generic',
      data: {
          id: 'variant_type',
          operand: 'all',
          values: ['SNP', 'deletion']
      }
  }
  */
  static structFromArgs(id, values = [], operand = FILTER_OPERAND_TYPE_DEFAULT) {
    return {
      id,
      type: FILTER_TYPE_GENERIC,
      operand,
      values,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      draft: null,
      selection: [],
      size: null,
      page: null,
      allOptions: null,
    };
    this.getEditor = this.getEditor.bind(this);
    this.getEditorLabels = this.getEditorLabels.bind(this);
    this.getEditorDraftInstruction = this.getEditorDraftInstruction.bind(this);
    this.getEditorInstruction = this.getEditorInstruction.bind(this);
    this.handleSearchByQuery = this.handleSearchByQuery.bind(this);
    this.handleOperandChange = this.handleOperandChange.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.handleCheckAllSelections = this.handleCheckAllSelections.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);

    // @NOTE Initialize Component State
    const { data, dataSet } = props;
    this.state.draft = cloneDeep(data);
    this.state.selection = data.values ? cloneDeep(data.values) : [];
    this.state.page = 1;
    this.state.size = 10;
    this.state.allOptions = cloneDeep(dataSet);

    const { selection, allOptions } = this.state;
    if (selection.length > 0) {
      const value = filter(cloneDeep(dataSet), o => selection.includes(o.value));
      if (value.length === 0) {
        const selectedValue = [];
        selection.map(x => selectedValue.push({ value: x, count: 0 }));
        allOptions.unshift(...selectedValue);
      } else {
        const sorted = orderBy(value, ['count'], ['desc']);
        pullAllBy(allOptions, cloneDeep(sorted), 'value');
        allOptions.unshift(...sorted);
      }
    }
  }

  getEditor() {
    const { config } = this.props;
    const {
      draft, selection, size, page, allOptions,
    } = this.state;
    const { operand } = draft;
    const allSelected = allOptions ? selection.length === allOptions.length : false;
    const selectAll = intl.get('screen.patientvariant.filter.selection.all');
    const selectNone = intl.get('screen.patientvariant.filter.selection.none');

    const minValue = size * (page - 1);
    const maxValue = size * page;

    pullAllBy(allOptions, [{ value: '' }], 'value');

    const options = allOptions.slice(minValue, maxValue).map((option) => {
      const value = option.value.length < 60 ? option.value : `${option.value.substring(0, 55)} ...`;
      return {
        label: (
          <span>
            <Tooltip title={option.value}>
              {value}
            </Tooltip>
            <Tag>{option.count}</Tag>
          </span>
        ),
        value: option.value,
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
              <Radio.Group type="primary" size="small" value={operand} onChange={this.handleOperandChange}>
                {config.operands.map(configOperand => (
                  <Radio.Button value={configOperand}>
                    {intl.get(`screen.patientvariant.filter.operand.${configOperand}`)}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Col>
          </Row>
          <br />
          <Row>
            <Checkbox
              key="check-all"
              className="selector"
              indeterminate={(!allSelected && selection.length > 0)}
              onChange={this.handleCheckAllSelections}
              checked={allSelected}
            />
            {(!allSelected ? selectAll : selectNone)}
          </Row>
          <br />
          <Row>
            <Col span={24}>
              <Checkbox.Group
                options={options}
                value={selection}
                onChange={this.handleSelectionChange}
              />
            </Col>
          </Row>
        </>
      ),
    };
  }

  getEditorDraftInstruction() {
    const { draft } = this.state;
    const { id, operand, values } = draft;

    return GenericFilter.structFromArgs(id, values, operand);
  }

  getEditorInstruction() {
    const { data } = this.props;
    const { id, operand, values } = data;

    return GenericFilter.structFromArgs(id, values, operand);
  }

  getEditorLabels() {
    const { data } = this.props;

    return {
      action: intl.get(`screen.patientvariant.filter.operand.${data.operand}`),
      targets: data.values,
    };
  }

  handleSearchByQuery(values) {
    const { dataSet } = this.props;
    const allOptions = cloneDeep(dataSet);
    const search = values.toLowerCase();
    const toRemove = filter(cloneDeep(allOptions), o => (search !== '' ? !o.value.toLowerCase().startsWith(search) : null));

    pullAllBy(allOptions, cloneDeep(toRemove), 'value');
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

  handleCheckAllSelections(e) {
    const { target } = e;
    if (!target.checked) {
      this.setState({
        selection: [],
      });
    } else {
      const { dataSet } = this.props;
      const selection = dataSet.map(option => option.value);
      this.setState({
        selection,
      });
    }
  }

  handleSelectionChange(values) {
    const {
      selection, allOptions, page, size, draft,
    } = this.state;

    const minValue = size * (page - 1);
    const maxValue = size * page;
    const options = allOptions.slice(minValue, maxValue);

    options.forEach((x) => {
      if (selection.includes(x.value)) {
        if (!values.includes(x.value)) {
          pull(selection, x.value);
        }
      } else if (values.includes(x.value)) {
        selection.push(x.value);
      }
    });

    draft.values = selection;
    this.setState({
      selection,
      draft,
    });
  }

  handleOperandChange(e) {
    const { config } = this.props;
    const operand = e.target.value;
    if (config.operands.indexOf(operand) !== -1) {
      const { draft } = this.state;
      draft.operand = operand;
      this.setState({ draft });
    }
  }

  render() {
    const { allOptions } = this.state;
    return (
      <Filter
        {...this.props}
        type={FILTER_TYPE_GENERIC}
        editor={this.getEditor()}
        searchable
        onSearchCallback={this.handleSearchByQuery}
        onPageChangeCallBack={this.handlePageChange}
        sortData={allOptions}
      />
    );
  }
}

GenericFilter.propTypes = {
  data: PropTypes.shape({}).isRequired,
  dataSet: PropTypes.array.isRequired,
  category: PropTypes.string,
  config: PropTypes.shape({}),
};

GenericFilter.defaultProps = {
  category: '',
  config: {
    operands: [FILTER_OPERAND_TYPE_ALL, FILTER_OPERAND_TYPE_ONE, FILTER_OPERAND_TYPE_NONE],
  },
};

export default GenericFilter;
