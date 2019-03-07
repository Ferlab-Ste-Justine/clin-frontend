import React from 'react';
import PropTypes from 'prop-types';
import {
  Card, Row, Col, Divider, Form, Typography, Icon, Input, Button,
} from 'antd';
import { injectIntl } from 'react-intl';

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
    // this.props.form.validateFields();
    // this.props.form.resetFields();
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
    const { form, handleLogin } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          submitLoading: true,
          forgotLoading: false,
        });
        handleLogin(values);
      }
    });
  }

  handleClick() {
    const { handleForgottenPassword } = this.props;
    this.setState({
      submitLoading: false,
      forgotLoading: true,
    });
    handleForgottenPassword();
  }

  render() {
    const { form, intl } = this.props;
    const { animationClass, submitLoading, forgotLoading } = this.state;
    const formErrorIsRequired = intl.formatMessage({ id: 'common.form.error.isRequired' });
    const formTextForgotPassword = intl.formatMessage({ id: 'form.login.forgotPassword' });
    const formTextHowToRegister = intl.formatMessage({ id: 'form.login.howToRegister' });
    const usernameField = intl.formatMessage({ id: 'form.login.usernameField' });
    const passwordField = intl.formatMessage({ id: 'form.login.passwordField' });
    const submitButton = intl.formatMessage({ id: 'form.login.submitButton' });

    const usernameError = form.isFieldTouched('userName') && form.getFieldError('userName');
    const passwordError = form.isFieldTouched('password') && form.getFieldError('password');

    return (
      <Card id="login" className={animationClass}>
        <Form onSubmit={this.handleSubmit}>
          <Row type="flex" justify="space-between">
            <Col className="left" span={11}>
              <Form.Item
                validateStatus={usernameError ? 'error' : ''}
                help={usernameError || ''}
              >
                {form.getFieldDecorator('userName', {
                  rules: [{ required: true, message: formErrorIsRequired }],
                })(
                  <Input prefix={<Icon type="user" />} placeholder={usernameField} autoComplete="off" />,
                )}
              </Form.Item>
              <Form.Item
                validateStatus={passwordError ? 'error' : ''}
                help={passwordError || ''}
              >
                {form.getFieldDecorator('password', {
                  rules: [{ required: true, message: formErrorIsRequired }],
                })(
                  <Input prefix={<Icon type="lock" />} type="password" placeholder={passwordField} autoComplete="off" />,
                )}
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon="login"
                loading={submitLoading}
                disabled={(forgotLoading || hasErrors(form.getFieldsError()))}
              >
                {submitButton}
              </Button>
            </Col>
            <Col>
              <Divider type="vertical" />
            </Col>
            <Col className="right" span={10}>
              <Typography.Paragraph type="secondary">
                {formTextHowToRegister}
              </Typography.Paragraph>
              <Divider />
              <Button
                type="secondary"
                icon="meh"
                loading={forgotLoading}
                disabled={(submitLoading || hasErrors(form.getFieldsError()))}
                onClick={this.handleClick}
              >
                {formTextForgotPassword}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    );
  }
}

LoginForm.propTypes = {
  form: PropTypes.shape({}).isRequired,
  intl: PropTypes.shape({}).isRequired,
  handleLogin: PropTypes.func.isRequired,
  handleForgottenPassword: PropTypes.func.isRequired,
};

const IntlLoginForm = injectIntl(LoginForm);

export default Form.create()(IntlLoginForm);
