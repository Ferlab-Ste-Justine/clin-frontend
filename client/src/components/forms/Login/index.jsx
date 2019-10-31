/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Card, Row, Col, Form, Icon, Input, Button, Typography
} from 'antd';
import { injectIntl } from 'react-intl';
import IconKit from 'react-icons-kit';
import { ic_email,  ic_https } from 'react-icons-kit/md';
import './style.scss';


const hasErrors = fieldsError => Object.keys(fieldsError).some(field => fieldsError[field]);

class LoginForm extends React.Component {
  constructor() {
    super();
    this.state = {
      animationClass: '',
      submitLoading: false,
      forgotLoading: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    const { form } = this.props;
    document.querySelector('#login .autofocus input').autofocus = true;
    form.setFields({
      username: {
        value: window.CLIN.defaultUsername,
      },
      password: {
        value: window.CLIN.defaultPassword,
      },
    });
    form.validateFields();
    this.setState({
      animationClass: 'animated flipInX',
    });
  }

  componentWillUnmount() {
    this.setState({
      animationClass: 'animated zoomOut',
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
    const { appIsLoading, form, intl } = this.props;
    const { animationClass } = this.state;
    const { submitLoading, forgotLoading } = this.state;
    const { Text } = Typography;

    const submitLoadingState = submitLoading && appIsLoading;
    const forgotLoadingState = forgotLoading && appIsLoading;
    const formErrorIsRequired = intl.formatMessage({ id: 'form.error.isRequired' });
    const formErrorIsNotEmail = intl.formatMessage({ id: 'form.error.isNotEmail' });
    const formTextForgotPassword = intl.formatMessage({ id: 'form.login.forgotPassword' });
    const usernameField = intl.formatMessage({ id: 'form.login.usernameField' });
    const usernamePlaceHolder = intl.formatMessage({ id: 'form.login.username.PlaceHolder' });
    const passwordField = intl.formatMessage({ id: 'form.login.passwordField' });
    const submitButton = intl.formatMessage({ id: 'form.login.submitButton' });
    const connexionTitle = intl.formatMessage({ id: 'form.login.headline5' });
    const createAccount = intl.formatMessage({ id: 'form.login.createAccount' });
    const introText = intl.formatMessage({ id: 'form.login.introText' });
    const usernameError = form.isFieldTouched('username') && form.getFieldError('username');
    const passwordError = form.isFieldTouched('password') && form.getFieldError('password');


    return (
      <Card bordered={false} id="login" className={animationClass}>
        <Row type="flex" justify="end">
          <a className="newAccount">{createAccount}</a>
        </Row>
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
                    className="autofocus"
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
  intl: PropTypes.shape({}).isRequired,
  handleAuthentication: PropTypes.func.isRequired,
  handlePasswordRecovery: PropTypes.func.isRequired,
};

const IntlLoginForm = injectIntl(LoginForm);

export default Form.create()(IntlLoginForm);
