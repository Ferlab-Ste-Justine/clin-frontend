/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Tabs, Pagination, Row, Col, Dropdown, Button, Icon, Checkbox, Popover, Card, Typography,
} from 'antd';
import {
  Column, Table, Utils, Cell, RenderMode,
} from '@blueprintjs/table';
import { cloneDeep } from 'lodash';


const VARIANT_TAB = 'variant'
const GENE_TAB = 'gene'

const mapResults = (results) => {
    const variantData = results.map((variant) => {
        return {
            variant: variant.mutationId,
            type: '1',
            dbsnp: '1',
            consequence: '1',
            clinvar: '1',
            vep: '1',
            sift: '1',
            polyph: '1',
            zygosity: '1',
            pubmed: '1',
        }
    })
    const geneData = results.map((gene) => {
        return {
            gene: '',
            type: '',
            localisation: '',
            variants: '',
            omin: '',
            orphanet: '',
            ensemble: '',
        }
    })

    return {
        variantData,
        geneData
    }
}

class VariantResultsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      size: 10,
      page: 1,
      visibleVariant: false,
      visibleGene: false,
      currentTab: null,
      visibleColumns: {
          [VARIANT_TAB]: [],
          [GENE_TAB]: []
      },
      variantColumns: [],
      variantData: [],
      geneColumns: [],
      geneData: [],
    };

    this.handlePageChange = this.handlePageChange.bind(this);
    this.getCellRenderer = this.getCellRenderer.bind(this);
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
    this.handleColumnsVisible = this.handleColumnsVisible.bind(this);
    this.renderTabColumns = this.renderTabColumns.bind(this);
    this.handleColumnsReordered = this.handleColumnsReordered.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);

    // @NOTE Initialize Component State
    this.state.currentTab = VARIANT_TAB
    this.state.variantColumns = [
        { key: 'variant', type: 'default' },
        { key: 'type' },
        { key: 'dbsnp' },
        { key: 'consequence' },
        { key: 'clinvar' },
        { key: 'vep' },
        { key: 'sift' },
        { key: 'polyph' },
        { key: 'zygosity' },
        { key: 'pubmed', type: 'pubmed' },
    ];
    this.state.geneColumns = [
        { key: 'gene', type: 'default' },
        { key: 'type' },
        { key: 'localisation' },
        { key: 'variants' },
        { key: 'omin' },
        { key: 'orphanet' },
        { key: 'ensemble' },
    ];
    this.state.visibleColumns[VARIANT_TAB] = Array.from(Array(this.state.variantColumns.length).keys())
    this.state.visibleColumns[GENE_TAB] = Array.from(Array(this.state.geneColumns.length).keys())
  }

  static getDerivedStateFromProps(nextProps) {
      const { results } = nextProps;
      if (!results) {
          return null;
      }

      return mapResults(results)
  }

  componentDidMount() {
    this.handleTabChange(VARIANT_TAB)
  }

  renderTabColumns() {
    const { intl } = this.props
    const {
        variantColumns, geneColumns, visibleColumns, currentTab,
    } = this.state;

    const columns = [];
    const visibleTabColumns = visibleColumns[currentTab];
    const columnData = currentTab === VARIANT_TAB ? variantColumns : geneColumns;

    columnData.map((datum, index) => (visibleTabColumns.includes(index) ? columns.push(
        <Column key={datum.key} name={intl.formatMessage({ id: `screen.patientvariant.results.table.${datum.key}` })} cellRenderer={this.getCellRenderer(datum.key, datum.type)} />
    ) : null));

    this.setState({
      columns,
    });
  }

  getCellRenderer(key, type) {
    const { currentTab, variantData, geneData } = this.state
    const data = currentTab === VARIANT_TAB ? variantData : geneData;

    switch (type) {
      default:
        return (row) => {
          const value = data[row] ? data[row][key] : '';
          return (
            <Cell>{value}</Cell>
          );
        };
    }
  }

  handlePageChange(page, size) {
    this.setState({
      page,
      size,
    });
  }

  handlePageSizeChange(page, size) {
    this.handlePageChange(page, size);
  }

  toggleMenu() {
    const { visibleVariant, visibleGene, currentTab } = this.state;
    currentTab === VARIANT_TAB ? this.setState({ visibleVariant: !visibleVariant }) : this.setState({ visibleGene: !visibleGene });
  }

  handleColumnsVisible(checkedValues) {
    const { visibleColumns, currentTab } = this.state;
    visibleColumns[currentTab] = checkedValues
    this.setState({
        columns: [],
        visibleColumns,
    }, () => this.renderTabColumns());
  }

  handleColumnsReordered(oldIndex, newIndex, length) {
    if (oldIndex === newIndex) {
      return;
    }
    const {
      columns, variantColumns, geneColumns, currentTab,
    } = this.state;

    const element = currentTab === VARIANT_TAB ? variantColumns[oldIndex] : geneColumns[oldIndex];
    variantColumns.splice(oldIndex, 1);
    variantColumns.splice(newIndex, 0, element);

    const nextChildren = Utils.reorderArray(columns, oldIndex, newIndex, length);
    this.setState({ columns: nextChildren });
  }

  handleTabChange(key) {
    this.setState({
      columns: [],
      currentTab: key,
      visibleVariant: false,
      visibleGene: false,
    }, () => this.renderTabColumns());
  }

  render() {
    const { TabPane } = Tabs;
    const {
      columns, variantColumns, geneColumns, size, page, visibleVariant, visibleGene, visibleColumns, currentTab, variantData, geneData
    } = this.state;

    const columnData = currentTab === VARIANT_TAB ? variantColumns : geneColumns;
    const columnSelectorIsVisible = currentTab === VARIANT_TAB ? visibleVariant : visibleGene;
    const defaultVisibleColumns = visibleColumns[currentTab]
    const count = currentTab === VARIANT_TAB ? variantData.length : geneData.length;

    console.log('columnData', columnData)
    console.log('defaultVisibleColumns', defaultVisibleColumns)

    if (count === 0) {
        return null
    }

    const overlay = (
      <Popover visible={columnSelectorIsVisible}>
        <Card>
          <Row>
            <Checkbox.Group className="checkbox" style={{ width: '100%' }} defaultValue={defaultVisibleColumns} onChange={this.handleColumnsVisible}>
              {columnData.map((column) => (
                <Row>
                  <Col>
                    <Checkbox value={column.key}>{column.key}</Checkbox>
                  </Col>
                </Row>
              ))}
            </Checkbox.Group>
          </Row>
        </Card>
      </Popover>
    );

    return (
      <Tabs key="variant-tabs" type="card" onChange={this.handleTabChange}>
        <TabPane tab="Variant" key={VARIANT_TAB}>
          <Row>
            <Col align="end">
              <Dropdown overlay={overlay} trigger={['click']} visible={visibleVariant}>
                <Button type="primary" onClick={this.toggleMenu}>
Column
                  <Icon type="caret-down" />
                </Button>
              </Dropdown>
            </Col>
          </Row>
          <br />
          <Row>
            <Col span={24}>
              <Table
                numRows={size}
                enableColumnReordering
                enableColumnResizing
                onColumnsReordered={this.handleColumnsReordered}
                renderMode={RenderMode.NONE}
                enableGhostCells
              >
                { columns.map(column => (column)) }
              </Table>
            </Col>
          </Row>
          <br />
          <Row>
            <Col align="end" span={24}>
              <Pagination
                total={count}
                pageSize={size}
                current={page}
                showSizeChanger
                onChange={this.handlePageChange}
                onShowSizeChange={this.handlePageSizeChange}
              />
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="Gene" key={GENE_TAB}>
          <Row>
            <Col align="end">
              <Dropdown overlay={overlay} trigger={['click']} visible={visibleGene}>
                <Button type="primary" onClick={this.toggleMenu}>
Column
                  <Icon type="caret-down" />
                </Button>
              </Dropdown>
            </Col>
          </Row>
          <br />
          <Row>
            <Col span={24}>
              <Table
                numRows={size}
                enableColumnReordering
                enableColumnResizing
                onColumnsReordered={this.handleColumnsReordered}
                renderMode={RenderMode.NONE}
                enableGhostCells
              >
                { columns.map(column => (column)) }
              </Table>
            </Col>
          </Row>
          <br />
          <Row>
            <Col align="end" span={24}>
              <Pagination
                total={40}
                pageSize={size}
                current={page}
                showSizeChanger
                onChange={this.handlePageChange}
                onShowSizeChange={this.handlePageSizeChange}
              />
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    );
  }
}


VariantResultsTable.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  data: PropTypes.array,
};

VariantResultsTable.defaultProps = {
  data: [],
};

export default VariantResultsTable;
