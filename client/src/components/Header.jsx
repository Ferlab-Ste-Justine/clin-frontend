import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import {
  Layout, Typography, Row, Col,
} from 'antd';
import { Mobile, Tablet, Desktop } from '../containers/Responsive';


const Header = ({ intl }) => {
  const title = intl.formatMessage({ id: 'header.title' });
  return (
    <Layout.Header id="header">
      <Row type="flex">
        <Col span={17}>
          <Desktop><Typography.Title level={1}>{ title }</Typography.Title></Desktop>
          <Tablet><Typography.Title level={2}>{ title }</Typography.Title></Tablet>
          <Mobile><Typography.Title level={4}>{ title }</Typography.Title></Mobile>
        </Col>
        <Col span={4} align="end">
          {/* eslint-disable-next-line max-len */}
          <img alt="Centre hospitalier universitaire Sainte-Justine" src="https://dummyimage.com/100x45/FFFFFF/000000.png&text=[+LOGO+CHUSJ+]" />
        </Col>
        <Col span={3} align="end">
          {/* eslint-disable-next-line max-len */}
          <img alt="Ministère de la Santé et des Services sociaux" src="https://dummyimage.com/100x45/FFFFFF/000000.png&text=[+LOGO+MIN.+SANTE+]" />
        </Col>
      </Row>
    </Layout.Header>
  );
};

Header.propTypes = {
  intl: PropTypes.shape({}).isRequired,
};

const mapStateToProps = state => ({
  intl: state.intl,
});

export default connect(
  mapStateToProps,
  {},
)(injectIntl(Header));
