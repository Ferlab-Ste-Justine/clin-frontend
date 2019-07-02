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
      <Row type="flex" justify="center">
        <Desktop>
          <Col span={16}>
            <Typography.Title level={1}>{ title }</Typography.Title>
          </Col>
          <Col span={8} align="end">
            <img height="55" alt="Centre hospitalier universitaire Sainte-Justine" src="/images/chusj.png" />
            <img height="45" style={{ marginLeft: 20 }} alt="Ministère de la Santé et des Services sociaux" src="/images/msss.png" />
          </Col>
        </Desktop>
        <Tablet>
          <Col span={15}>
            <Typography.Title level={2}>{ title }</Typography.Title>
          </Col>
          <Col span={9} align="end">
            <img height="50" alt="Centre hospitalier universitaire Sainte-Justine" src="/images/chusj.png" />
            <img height="40" style={{ marginLeft: 10 }} alt="Ministère de la Santé et des Services sociaux" src="/images/msss.png" />
          </Col>
        </Tablet>
        <Mobile>
          <Col span={15}>
            <Typography.Title level={4}>{ title }</Typography.Title>
          </Col>
          <Col span={9} align="end">
            <img height="35" alt="Centre hospitalier universitaire Sainte-Justine" src="/images/chusj.png" />
            <img height="30" style={{ marginLeft: 10 }} alt="Ministère de la Santé et des Services sociaux" src="/images/msss.png" />
          </Col>
        </Mobile>
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
