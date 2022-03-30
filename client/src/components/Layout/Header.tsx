/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import intl from 'react-intl-universal';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Layout, Menu, Row } from 'antd';
import { showTranslationBtn } from 'helpers/toggleFeature';

import AccountCircleIcon from 'components/Assets/Icons/AccountCircleIcon';
import SupervisorIcon from 'components/Assets/Icons/SupervisorIcon';
import TranslateIcon from 'components/Assets/Icons/TranslateIcon';

import { changeLanguage } from '../../actions/app';
import { logoutUser } from '../../actions/user';
import { State } from '../../reducers';
import Dropdown from '../Dropdown';

const userMenu = (logoutButtonRef?: React.MutableRefObject<HTMLButtonElement | null>) => {
  const dispatch = useDispatch();
  return (
    <Menu getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentNode as HTMLElement}>
      <Menu.Item key="logout">
        <Button
          id="logout-button"
          onClick={() => dispatch(logoutUser())}
          ref={logoutButtonRef}
          type="text"
        >
          <LogoutOutlined />
          {`${intl.get('header.navigation.user.logout')}`}
        </Button>
      </Menu.Item>
    </Menu>
  );
};

const languageMenu = (frButtonRef?: React.MutableRefObject<HTMLButtonElement | null>) => {
  const dispatch = useDispatch();
  return (
    <Menu getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentNode as HTMLElement}>
      <Menu.Item>
        <Button
          onClick={() => {
            dispatch(changeLanguage('fr'));
          }}
          ref={frButtonRef}
          type="text"
        >
          {intl.get('lang.fr.long')}
        </Button>
      </Menu.Item>

      <Menu.Item>
        <Button
          onClick={() => {
            dispatch(changeLanguage('en'));
          }}
          type="text"
        >
          {intl.get('lang.en.long')}
        </Button>
      </Menu.Item>
    </Menu>
  );
};

const Header: React.FC = () => {
  // @ts-ignore
  const lang = intl.options.currentLocale;
  const title = intl.get('header.title');
  const langText = intl.get(`lang.${lang}.short`);
  const user = useSelector((state: State) => state.user);
  const app = useSelector((state: State) => state.app);
  return (
    <Layout.Header id="header">
      <Row className="flex-row">
        <Col>
          <img alt={title} className="logo" src="/assets/logos/cqgc-white.svg" />
        </Col>
        <div className="secondaryNav">
          {user.username && (
            <>
              <div className="navigation">
                <Row align="middle" className="flex-row" justify="space-between">
                  <Col className="patientList">
                    <Link to="/patient/search">
                      <SupervisorIcon />
                      {intl.get('header.navigation.patient')}
                    </Link>
                  </Col>
                  <Divider type="vertical" />
                </Row>
              </div>
              <Col>
                <Dropdown overlay={userMenu()} trigger={['click']}>
                  <Button icon={<AccountCircleIcon />} type="text">
                    {` ${user.firstName} `}
                  </Button>
                </Dropdown>
              </Col>
            </>
          )}
          {showTranslationBtn ? (
            <Col className="translateBtn">
              {app.locale.lang && (
                <Dropdown
                  getPopupContainer={(triggerNode: HTMLElement) =>
                    triggerNode.parentNode as HTMLElement
                  }
                  overlay={languageMenu()}
                  trigger={['click']}
                >
                  <Button icon={<TranslateIcon />} type="text">
                    {langText}
                  </Button>
                </Dropdown>
              )}
            </Col>
          ) : null}
        </div>
      </Row>
    </Layout.Header>
  );
};

export default Header;
