/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import { Tabs , Pagination , Row , Col , Dropdown, Button , Icon , Checkbox , Popover, Card , Typography } from 'antd';
import {
  Column, Table, Utils, Cell, RenderMode,
} from '@blueprintjs/table';
import {cloneDeep} from 'lodash';


class VariantResultsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      size: 10,
      page: 1,
      visibleVariant:false,
      visibleGene:false,
      currentTab:"Variant",
      variantVisibleColumn:[],
      variantColumnData:[],
      geneColumnData:[],
      geneVisibleColumn:[],

    };
    this.state.variantColumnData = [ {Name : "ID" , Format : "ID" },
                        {Name : "Variant" , Format : "Default" },
                        {Name : "Type" , Format : "Default" },
                        {Name : "dbSnp" , Format : "Default" },
                        {Name : "Conséquence(s)" , Format : "Consequence" },
                        {Name : "Impact clinique (CLINVAR)" , Format : "Default" },
                        {Name : "Impact fonctionnel (VEP)" , Format : "Default" },
                        {Name : "SIFT" , Format : "Default" },
                        {Name : "Polyphe" , Format : "Default" },
                        {Name : "# patients dans la cohorte interne" , Format : "Default" },
                        {Name : "Fréquence dans la cohorte interne" , Format : "Default" },
                        {Name : "Zygosité" , Format : "Default" },
                        {Name : "Pubmed" , Format : "Pubmed" }]

    this.state.geneColumnData = [ {Name : "Gene" , Format : "ID" },
                        {Name : "Type" , Format : "Default" },
                        {Name : "Localisation" , Format : "Default" },
                        {Name : "# de Variants" , Format : "Default" },
                        {Name : "ID OMIM" , Format : "Default" },
                        {Name : "Orphanet ID" , Format : "Default" },
                        {Name : "ID Ensemble" , Format : "Default" },]

    this.state.variantVisibleColumn=Array.from(Array(this.state.variantColumnData.length).keys())
    this.state.geneVisibleColumn=Array.from(Array(this.state.geneColumnData.length).keys())

    this.handlePageChange = this.handlePageChange.bind(this)
    this.getCellRenderer = this.getCellRenderer.bind(this)
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this)
    this.toggleMenu = this.toggleMenu.bind(this)
    this.handleColumnsVisible = this.handleColumnsVisible.bind(this)
    this.renderColumn=this.renderColumn.bind(this)
    this.handleColumnsReordered=this.handleColumnsReordered.bind(this)
    this.handleTabChange = this.handleTabChange.bind(this)

  }

  componentDidMount() {
     this.renderColumn()
  }

  renderColumn(){
     const{variantColumnData, geneColumnData,columns , variantVisibleColumn , geneVisibleColumn , currentTab} = this.state

     const visibleColumn = currentTab === "Variant" ? variantVisibleColumn : geneVisibleColumn
     const columnData = currentTab === "Variant" ? variantColumnData : geneColumnData

     columnData.map((info,index) =>
            visibleColumn.includes(index) ? columns.push( <Column key={index} name={info.Name} cellRenderer={this.getCellRenderer('normal', info.Format)}/>) : null)

     this.setState({
         columns
     })
    }

  getCellRenderer(key, type) {
    const { Text } = Typography;
      switch (type) {
        case 'Default':
          return (row) => {
            return (
              <Cell>
              </Cell>
            );
          };

        case 'ID':
          return (row) => {
            return (
              <Cell>
              </Cell>
            );
          };

        case 'Consequence':
          return (row) => {
            return (
              <Cell>
              </Cell>
            );
          };

        case 'Pubmed':
          return (row) => {
            return (
              <Cell>
              </Cell>
            );
          };

        default:
          return (row) => {
            return (
              <Cell>
              </Cell>
            );
          };
      }
    }

  handlePageChange(page , size) {
    this.setState({
      page,
      size
    });
  }

  handlePageSizeChange(page, size) {
    this.handlePageChange(page, size);
  }

  toggleMenu(test) {
    const value = test.target.children[0].innerHTML
    const {visibleVariant , visibleGene , currentTab} = this.state
    currentTab === "Variant" ? this.setState({ visibleVariant: !visibleVariant }) : this.setState({ visibleGene: !visibleGene})
  }

  handleColumnsVisible(checkedValues) {
    const {variantVisibleColumn , geneVisibleColumn , currentTab} = this.state
    if(currentTab === "Variant"){
        this.setState({
            variantVisibleColumn:checkedValues,
            columns:[]
        }, ()=> this.renderColumn())
    }
    else{
        this.setState({
            geneVisibleColumn:checkedValues,
            columns:[]
        }, ()=> this.renderColumn())
    }

  }

  handleColumnsReordered(oldIndex, newIndex, length) {
    if (oldIndex === newIndex) {
      return;
    }
    const { columns, variantColumnData , geneColumnData , currentTab } = this.state;
    if(currentTab === "Variant"){
        const element = variantColumnData[oldIndex];
        variantColumnData.splice(oldIndex, 1);
        variantColumnData.splice(newIndex, 0, element);
    }
    else{
        const element = geneColumnData[oldIndex];
        geneColumnData.splice(oldIndex, 1);
        geneColumnData.splice(newIndex, 0, element);
    }

    const nextChildren = Utils.reorderArray(columns, oldIndex, newIndex, length);
    this.setState({ columns: nextChildren });
  }

  handleTabChange(key, tab){
    this.setState({
        columns:[],
        currentTab:key,
        visibleVariant:false,
        visibleGene:false,

    }, ()=> this.renderColumn())
  }

  render() {
    const { TabPane } = Tabs;
    const {columns, variantColumnData, geneColumnData , size , page , visibleVariant , visibleGene , variantVisibleColumn , geneVisibleColumn , currentTab} = this.state;

    const columnData = currentTab === "Variant" ? variantColumnData : geneColumnData
    const isvisible =currentTab === "Variant" ? visibleVariant : visibleGene
    const defaultValue =  currentTab === "Variant" ? variantVisibleColumn : geneVisibleColumn
    const overlay = (
        <Popover visible={isvisible}>
          <Card>
            <Row>
              <Checkbox.Group className="checkbox" style={{ width: '100%' }} defaultValue={defaultValue} onChange={this.handleColumnsVisible}>
                {columnData.map((info,index) =>
                    <Row>
                      <Col>
                        <Checkbox value={index}>{info.Name}</Checkbox>
                      </Col>
                    </Row>
                )}
              </Checkbox.Group>
            </Row>
          </Card>
        </Popover>
    );

    return(
      <Tabs type="card" onChange={this.handleTabChange}>
        <TabPane tab="Variant" key="Variant">
            <Row>
              <Col align="end">
                  <Dropdown overlay={overlay} trigger={['click']} visible={visibleVariant} >
                      <Button type="primary" onClick={this.toggleMenu}>Column <Icon type="caret-down"/></Button>
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
                    onCompleteRender={this.handleTableCellsRendered}
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
        <TabPane tab="Gene" key="Gene">
          <Row>
            <Col align="end">
                <Dropdown overlay={overlay} trigger={['click']} visible={visibleGene} >
                    <Button type="primary" onClick={this.toggleMenu}>Column <Icon type="caret-down"/></Button>
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
                  onCompleteRender={this.handleTableCellsRendered}
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
    data: []
};

export default VariantResultsTable;
