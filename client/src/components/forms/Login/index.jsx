/* eslint-disable camelcase,  jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Card, Row, Col, Form, Input, Button, Typography, Alert,
} from 'antd';
import intl from 'react-intl-universal';
import IconKit from 'react-icons-kit';
import { ic_email, ic_https } from 'react-icons-kit/md';
import './style.scss';
import style from '../../../containers/App/style.module.scss';


const hasErrors = fieldsError => Object.keys(fieldsError).some(field => fieldsError[field]);

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitLoading: false,
      forgotLoading: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    const { form } = this.props;
    form.setFields({
      username: {
        value: window.CLIN.defaultUsername,
      },
      password: {
        value: window.CLIN.defaultPassword,
      },
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { form, handleAuthentication } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          submitLoading: true,
          forgotLoading: false,
        });
        handleAuthentication(values.username, values.password);
      }
    });
  }

  handleClick() {
    const { handlePasswordRecovery } = this.props;
    this.setState({
      submitLoading: false,
      forgotLoading: true,
    });
    handlePasswordRecovery();
  }

  render() {
    const { appIsLoading, form, loginMessage } = this.props;
    const { submitLoading, forgotLoading } = this.state;
    const { Text } = Typography;

    const submitLoadingState = submitLoading && appIsLoading;
    const forgotLoadingState = forgotLoading && appIsLoading;
    const formErrorIsRequired = intl.get('form.error.isRequired');
    const formErrorIsNotEmail = intl.get('form.error.isNotEmail');
    const formTextForgotPassword = intl.get('form.login.forgotPassword');
    const usernameField = intl.get('form.login.usernameField');
    const usernamePlaceHolder = intl.get('form.login.username.PlaceHolder');
    const passwordField = intl.get('form.login.passwordField');
    const submitButton = intl.get('form.login.submitButton');
    const connexionTitle = intl.get('form.login.headline5');
    const createAccount = intl.get('form.login.createAccount');
    const introText = intl.get('form.login.introText');
    const alertTitle = intl.get('form.login.connectionError.title');
    const alertDescription = intl.get('form.login.connectionError.description');
    const usernameError = form.isFieldTouched('username') && form.getFieldError('username');
    const passwordError = form.isFieldTouched('password') && form.getFieldError('password');

    return (
      <Card bordered={false} id="login">
        <Row type="flex" justify="end">
          <a className="newAccount">{createAccount}</a>
        </Row>
        {loginMessage
          ? (
            <Row>
              <Alert
                className="loginAlert"
                message={alertTitle}
                description={alertDescription}
                type="error"
                closable
              />
            </Row>
          ) : null }
        <Row>
          <Text type="primary" className="loginTitle">{connexionTitle}</Text>
        </Row>
        <Row className="introText">
          {introText}
        </Row>
        <Row type="flex">
          <Col className="left">
            <Form onSubmit={this.handleSubmit}>
              <Form.Item
                validateStatus={usernameError ? 'error' : ''}
                help={usernameError || ''}
                label={usernameField}
              >
                {form.getFieldDecorator('username', {
                  rules: [
                    { required: true, message: formErrorIsRequired },
                    { type: 'email', message: formErrorIsNotEmail },
                  ],
                })(
                  <Input
                    suffix={<IconKit size={16} icon={ic_email} />}
                    placeholder={usernamePlaceHolder}
                    autoComplete="off"
                    className={`${style.input} autofocus`}
                    autoFocus
                  />,
                )}
              </Form.Item>
              <Form.Item
                validateStatus={passwordError ? 'error' : ''}
                help={passwordError || ''}
                label={passwordField}
              >
                {form.getFieldDecorator('password', {
                  rules: [{ required: true, message: formErrorIsRequired }],
                })(
                  <Input
                    suffix={<IconKit size={16} icon={ic_https} />}
                    placeholder={passwordField}
                    autoComplete="off"
                    type="password"
                    className={`${style.input}`}
                  />,
                )}
              </Form.Item>
              <a className="forgotPass" onClick={this.handleClick}>
                {formTextForgotPassword}
              </a>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitLoadingState}
                disabled={(forgotLoadingState || hasErrors(form.getFieldsError()))}
                className={`${style.btnPrimary} ${style.btn}`}
              >
                {submitButton}
              </Button>
            </Form>
          </Col>
        </Row>
      </Card>
    );
  }
}

LoginForm.propTypes = {
  appIsLoading: PropTypes.bool.isRequired,
  form: PropTypes.shape({}).isRequired,
  handleAuthentication: PropTypes.func.isRequired,
  handlePasswordRecovery: PropTypes.func.isRequired,
  loginMessage: PropTypes.string.isRequired,
};

export default Form.create()(LoginForm);
