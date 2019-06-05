import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import {
  Card, Table, AutoComplete,
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
    const { search } = this.props;
    return (
      <Content>
        <Header />
        <Navigation />
        <Card>
          <AutoComplete placeholder="placeholder" dataSource={search} onChange={this.handleSearchChange} />
          <Table />
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
