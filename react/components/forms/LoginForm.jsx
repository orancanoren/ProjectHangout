import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Row, Col, CardPanel, Input, 
    Button, Icon, Preloader } from 'react-materialize';

class LoginForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            flashback: '',
            login_failed: false,
            login_pending: false
        }

        this.submitLogin = this.submitLogin.bind(this);
        this.onClickLogin = this.onClickLogin.bind(this);
        this.inputCheck = this.inputCheck.bind(this);
        this.onClickForgotPass = this.onClickForgotPass.bind(this);
    }

    inputCheck(callback) {
        const email = document.getElementById('email_field').value;
        const pw = document.getElementById('pw_field').value;

        if (email == '' || pw == '')
            return callback(null, null);
        return callback(email, pw);
    }

    submitLogin(email, pw, callback) {
        const request = {
            method: 'post',
            url: '/api/login',
            data: {
                email_input: email,
                password_input: pw,
                rememberMe: document.getElementById('rememberMe-field').value
            }
        }

        axios(request)
        .then((response) => {
            console.log(response.data);
            if (response.data.success) {
                return callback(null, response.data.success);
            }
            else {
                this.setState({
                    login_pending: false
                });
                return this.props.handleToast('Wrong email or password');
            }
        })
        .catch((err) => {
            console.error(err);
            callback(err);
        });
    }

    onClickLogin() {
        // 1 - Put the loading indicator
        this.inputCheck((email, pw) => {
            if (!email)
                return this.props.handleToast('Please enter valid credentials');

            this.setState({
                login_pending: true
            });
            document.getElementById('email_field').value = '';
            document.getElementById('pw_field').value = '';
            this.submitLogin(email, pw, (err, auth) => {
                if (auth)
                    window.location = '/profile';
                else {
                    console.error('err in onCLickLogin:', err)
                }
            });
        });
    }

    onClickForgotPass() {
        this.props.handleToast('This functionality is under development');
    }

    componentWillUpdate() {
        if (this.state.toast_message != '') {
            this.props.handleToast(this.state.toast_message);
            this.state.toast_message = '';
        }
    }

    render() {
        return (
            <CardPanel className='transparent'>
                <Row>
                    <Col s={12}>
                        <Input name='email_input' type='email' label='Email' id='email_field'>
                        <Icon>mail_outline</Icon></Input>
                    </Col>
                    <Col s={12}>
                        <Input name='password_input' type='password' label='Password' id='pw_field'>
                        <Icon>lock_outline</Icon></Input>
                    </Col>
                    <Col s={12}>
                        <Input label='Remember me' type='checkbox' name='rememberMe'
                        id='rememberMe-field' defaultChecked='checked'/>
                    </Col>
                </Row>
                <Row>
                    <Col s={12}>
                    {   !this.state.login_pending &&
                        <Button waves='light' className="btn light-blue" 
                        type="submit" name="action" onClick={this.onClickLogin}>Submit</Button>
                    }
                    {
                        this.state.login_pending &&
                        <Preloader size='small'/>
                    }
                    </Col>
                </Row>
                <Row>
                    <Col s={6}>
                    <Link to='/signup'><p className="margin medium-small link_p">Register now</p></Link>
                    </Col>
                    <Col s={6}>
                        <p className="margin right-align medium-small link_p" onClick={this.onClickForgotPass}>Forgot password?</p>
                    </Col>
                </Row>
            </CardPanel>
        );
    }
}

export default LoginForm;