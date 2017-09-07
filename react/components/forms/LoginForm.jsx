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
                    this.setState({
                        login_pending: false
                    });
                }
            });
        });
    }

    onClickForgotPass() {
        this.props.handleToast('This functionality is under development');
    }

    render() {
        return (
            <div>
                <Input name='email_input' type='email' label='Email' id='email_field'>
                <Icon>mail_outline</Icon></Input>
                <Input name='password_input' type='password' label='Password' id='pw_field'>
                <Icon>lock_outline</Icon></Input>
                <br />
                <div style={{ height: '50px', width: '100%'}}>
                    <div style={{ float: 'left' }}>
                    <Input label='Remember me' type='checkbox' name='rememberMe'
                        id='rememberMe-field' defaultChecked='checked'/>
                    </div>
                </div>
                <Row>
                {   !this.state.login_pending &&
                    <Button waves='light' className="btn light-blue" 
                        type="submit" name="action" onClick={this.onClickLogin}>Submit</Button>
                }
                {
                    this.state.login_pending &&
                    <Preloader size='small'/>
                }
                </Row>
                <Row>
                <Link to='/signup'><span className="link_p left">Register now</span></Link>
                    <span className="link_p right" onClick={this.onClickForgotPass}>Forgot password?</span>
                </Row>
            </div>
        );
    }
}

export default LoginForm;