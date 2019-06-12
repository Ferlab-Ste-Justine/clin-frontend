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
          <img height="55" alt="Centre hospitalier universitaire Sainte-Justine" src="/images/chusj.png" />
        </Col>
        <Col span={3} align="end">
          {/* eslint-disable-next-line max-len */}
          <img height="45" alt="Ministère de la Santé et des Services sociaux" src="/images/msss.png" />
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
