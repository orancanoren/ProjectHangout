import React from 'react';

class LoginForm extends React.Component {
    onClickForgotPass() {
        alert('This functionality is under development');
    }

    render() {
        return (
            <div className="col s12 z-depth-6 card-panel transparent">
                <form className="login-form" method='POST' action='/'>
                    <div className="row">
                    </div>
                    <div className="row">
                        <div className="input-field col s12">
                            <i className="material-icons prefix white-text">mail_outline</i>
                            <input className="validate" id="email" type="email" placeholder='Email'/>
                        </div>
                        <div className="input-field col s12">
                            <i className="material-icons prefix white-text">lock_outline</i>
                            <input id="password" type="password" placeholder='Password' />
                        </div>
                        <div className="input-field col s12 m12 l12  login-text left-align checkbox-color">
                            <input type="checkbox" id="remember-me" />
                            <label htmlFor="remember-me">Remember me</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="input-field col s12">
                            <button className="btn waves-effect waves-light col s12 light-blue darken-4" type="submit" name="action">Login</button>
                        </div>
                    </div>
                    <div className="row">
                        <div className="input-field col s6 m6 l6">
                            <p className="margin medium-small"><a href="/signup">Register Now!</a></p>
                        </div>

                        <div className="input-field col s6 m6 l6">
                            <p className="margin right-align medium-small"><a href="#" onClick={this.onClickForgotPass}>Forgot password?</a></p>
                        </div>
                    </div>

                </form>
            </div>
        );
    }
}

export default LoginForm;