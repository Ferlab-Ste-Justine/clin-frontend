/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import intl from 'react-intl-universal';
import { useDispatch, useSelector } from 'react-redux';
import {
  Layout, Row, Col, Menu, Divider, Button,
} from 'antd';
import IconKit from 'react-icons-kit';
import { ic_translate, ic_account_circle, ic_supervisor_account } from 'react-icons-kit/md';
import { Link } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';
import { logoutUser } from '../../actions/user';
import { changeLanguage } from '../../actions/app';
import { State } from '../../reducers';
import Dropdown from '../Dropdown';

const userMenu = (logoutButtonRef?: React.MutableRefObject<HTMLButtonElement | null>) => {
  const dispatch = useDispatch();
  return (
    <Menu
      getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentNode as HTMLElement}
    >
      <Menu.Item key="logout">
        <Button
          ref={logoutButtonRef}
          onClick={() => dispatch(logoutUser())}
          type="text"
          id="logout-button"
        >
          <LogoutOutlined />
          { `${intl.get('header.navigation.user.logout')}` }
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
          ref={frButtonRef}
          type="text"
          onClick={() => {
            dispatch(changeLanguage('fr'));
          }}
        >
          { intl.get('lang.fr.long') }
        </Button>
      </Menu.Item>

      <Menu.Item>
        <Button
          type="text"
          onClick={() => {
            dispatch(changeLanguage('en'));
          }}
        >
          { intl.get('lang.en.long') }
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
          <img className="logo" alt={title} src="/assets/logos/cqgc-white.svg" />
        </Col>
        <div className="secondaryNav">
          { user.username !== null && (
            <>
              <div className="navigation">
                <Row className="flex-row" justify="space-between" align="middle">
                  <Col className="patientList">
                    <Link to="/patient/search" className="ant-dropdown-link">
                      <IconKit size={16} icon={ic_supervisor_account} />
                      { intl.get('header.navigation.patient') }
                    </Link>
                  </Col>
                  <Divider type="vertical" />
                </Row>
              </div>
              <Col className="userName">
                <Dropdown
                  overlay={userMenu()}
                  trigger={['click']}
                >
                  <Button type="text" className="ant-dropdown-link">
                    <IconKit size={16} icon={ic_account_circle} />
                    { ` ${user.firstName} ` }
                  </Button>
                </Dropdown>
              </Col>
            </>
          ) }
          <Col>
            { app.locale.lang !== null && (
              <Dropdown
                overlay={languageMenu()}
                trigger={['click']}
                getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentNode as HTMLElement}
              >
                <Button type="text" className="ant-dropdown-link">
                  <IconKit size={16} icon={ic_translate} />
                  { langText }
                </Button>
              </Dropdown>
            ) }
          </Col>
        </div>

      </Row>
    </Layout.Header>
  );
};

export default (Header);
