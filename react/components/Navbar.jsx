import React from 'react';
import PropTypes from 'prop-types';

class Navbar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const isLoggedIn = this.props.logged_in;
        var authButton;
        if (isLoggedIn)
            authButton = <li><a href="/logout">Logout</a></li>;
        else
            authButton = <li><a href="/">Login</a></li>;
        return (
            <nav className="light-blue">
                <div className="container">
                    <div className="nav-wrapper">
                        <a href="/" className="brand-logo left" id="logo">{this.props.title}</a>
                        <ul id="nav-mobile" className="right">
                            {authButton}
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
}

Navbar.propTypes = {
    title: PropTypes.string.isRequired,
    logged_in: PropTypes.bool.isRequired
};

export default Navbar;