/* eslint-disable */
import React from 'react';
import { Tabs , Pagination , Row , Col , Dropdown , Menu , Button , Icon , Checkbox , Popover, Card , Typography } from 'antd';
import {
  Column, Table, Utils, Cell, RenderMode,
} from '@blueprintjs/table';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';

class VariantTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      size: 10,
      page: 1,
      visible:false,
      visibleColumn:[],
      data:[]

    };
    this.state.data = [ {Name : "ID" , Format : "ID" },
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

    this.state.visibleColumn=[0,1,2,3,4,5,6,7,8,9,10,11,12]
    this.handlePageChange = this.handlePageChange.bind(this)
    this.getCellRenderer = this.getCellRenderer.bind(this)
    this.handlePageSizeChange = this.handlePageSizeChange.bind(this)
    this.toggleMenu = this.toggleMenu.bind(this)
    this.onChange = this.onChange.bind(this)
    this.renderColumn=this.renderColumn.bind(this)
    this.handleColumnsReordered=this.handleColumnsReordered.bind(this)

  }

  componentDidMount() {
     this.renderColumn()
  }

    renderColumn(){
        const{data, columns , visibleColumn} = this.state
        data.map((info,index) =>
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
                <a>Lien vers variant</a>
              </Cell>
            );
          };

        case 'Consequence':
          return (row) => {
            return (
              <Cell>
                missense: <span className="consequence">[KRAS] </span>
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

  toggleMenu() {
    const {visible} = this.state
    this.setState({ visible: !visible });
  }

  onChange(checkedValues) {
    const {visibleColumn} = this.state
    this.setState({
        visibleColumn:checkedValues,
        columns:[]
    }, ()=> this.renderColumn())
  }

  handleColumnsReordered(oldIndex, newIndex, length) {
    if (oldIndex === newIndex) {
      return;
    }
    const { columns, data } = this.state;
    const element = data[oldIndex];
    data.splice(oldIndex, 1);
    data.splice(newIndex, 0, element);
    const nextChildren = Utils.reorderArray(columns, oldIndex, newIndex, length);
    this.setState({ columns: nextChildren });
  }

  render() {
    const { TabPane } = Tabs;
    const {columns, data, size , page , visible , visibleColumn} = this.state;
    const overlay = (
        <Popover visible={visible}>
          <Card>
            <Row>
              <Checkbox.Group className="checkbox" style={{ width: '100%' }} defaultValue={visibleColumn} onChange={this.onChange}>
                {data.map((info,index) =>
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
      <Tabs type="card">
        <TabPane tab="Variant" key="1">
            <Row>
              <Col align="end">
                  <Dropdown overlay={overlay} trigger={['click']} visible={visible}>
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
        <TabPane tab="Gene" key="2">
          Content of Tab Pane 2
        </TabPane>
      </Tabs>
    );
  }

}

const mapStateToProps = state => ({
  intl: state.intl,
  patient: state.patient,
  variant: state.variant,
});

export default connect(
  mapStateToProps,
)(injectIntl(VariantTable));