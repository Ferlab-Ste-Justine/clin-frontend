import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import {
  Card, Table, AutoComplete, Row, Col, Input, Icon,
} from 'antd';
// import { Link } from 'react-router-dom';

import Header from '../../Header';
import Navigation from '../../Navigation';
import Content from '../../Content';
import Footer from '../../Footer';

import './style.scss';


class PatientSearchScreen extends React.Component {
  constructor() {
    super();
    this.handleSearchChange = () => {};
  }

  render() {
    const { search, intl } = this.props;
    const placeholderText = intl.formatMessage({ id: 'screen.patientsearch.placeholder' });
    return (
      <Content>
        <Header />
        <Navigation />
        <Card>
          <Row type="flex" justify="center">
            <Col span={24}>
              <AutoComplete
                dataSource={search}
                onChange={this.handleSearchChange}
                size="large"
                style={{ width: '100%' }}
                optionLabelProp="text"
                placeholder={placeholderText}
                allowClear
                autoFocus
              >
                <Input prefix={<Icon type="search" className="certain-category-icon" />} />
              </AutoComplete>
            </Col>
          </Row>
          <Row type="flex" justify="center">
            <Col span={24}>
              <Table />
            </Col>
          </Row>
        </Card>
        <Footer />
      </Content>
    );
  }
}

PatientSearchScreen.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  search: PropTypes.shape({}).isRequired,
};

export default injectIntl(PatientSearchScreen);
