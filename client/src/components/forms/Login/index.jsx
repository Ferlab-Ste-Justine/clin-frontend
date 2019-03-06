/* eslint-disable */
import React from 'react';
import { Card, Row, Col, Divider, Form, Typography, Icon, Input, Button } from 'antd';
import { injectIntl } from 'react-intl';

import './style.scss';

const hasErrors = (fieldsError) => {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class LoginForm extends React.Component {

    constructor() {
        super();
        this.state = {
            loading: false
        };
        this._handleSubmit = this._handleSubmit.bind(this);
    }

    componentDidMount() {
        this.props.form.validateFields();
        this.props.form.resetFields();
    }

    _handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    loading: true
                });
                this.props.handleSubmit(values);
            }
        });
    }

    render() {
        const { form, intl } = this.props;
        const formErrorIsRequired = intl.formatMessage({id: 'common.form.error.isRequired'});
        const formTextForgotPassword = intl.formatMessage({id: 'form.login.forgotPassword'});
        const formTextHowToRegister = intl.formatMessage({id: 'form.login.howToRegister'});
        const usernameField = intl.formatMessage({id: 'form.login.usernameField'});
        const passwordField = intl.formatMessage({id: 'form.login.passwordField'});
        const submitButton = intl.formatMessage({id: 'form.login.submitButton'});

        const usernameError = form.isFieldTouched('userName') && form.getFieldError('userName');
        const passwordError = form.isFieldTouched('password') && form.getFieldError('password');

        return (
            <Card id="login">
                <Form onSubmit={this._handleSubmit} autoComplete="off">
                    <Form.Item
                        validateStatus={usernameError ? 'error' : ''}
                        help={usernameError || ''}
                    >
                        {form.getFieldDecorator('userName', {
                            rules: [{required: true, message: formErrorIsRequired}],
                        })(
                            <Input prefix={<Icon type="user"/>} placeholder={usernameField} autoComplete="off" />
                        )}
                    </Form.Item>
                    <Form.Item
                        validateStatus={passwordError ? 'error' : ''}
                        help={passwordError || ''}
                    >
                        {form.getFieldDecorator('password', {
                            rules: [{required: true, message: formErrorIsRequired}],
                        })(
                            <Input prefix={<Icon type="lock"/>} type="password" placeholder={passwordField} autoComplete="off" />
                        )}
                    </Form.Item>
                    <Form.Item>
                        <Row type="flex" justify="space-between">
                            <Col span={14}>
                                <a href="#">
                                    {formTextForgotPassword}
                                </a>
                            </Col>
                            <Col span={8}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon="login"
                                    loading={this.state.loading}
                                    disabled={hasErrors(form.getFieldsError())}
                                >
                                    {submitButton}
                                </Button>
                            </Col>
                        </Row>
                    </Form.Item>
                    <Divider />
                    <Card.Meta description={formTextHowToRegister} />
                </Form>
            </Card>
        );
    }
}

const IntlLoginForm = injectIntl(LoginForm);

export default Form.create()(IntlLoginForm);
