import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ProgressBar } from 'react-materialize';

class Navbar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        var authButton;
        if (this.props.logged_in)
            authButton = <li><a href="/logout">Logout</a></li>;
        else
            authButton = <li><a href="/">Login</a></li>;

        const navbar_height = 64;
        const logo_len = 58;
        
        return (
            <nav className="light-blue darken-4">
                <ProgressBar progress={this.props.progress} />
                <div className="container">
                    <div className="nav-wrapper">
                        <Link to='/profile' className='left'>
                            <div id='brand-logo'>
                                <img src="/assets/BrandLogo.png" 
                                style={{width: String(logo_len) + 'px', height: String(logo_len) + 'px', marginTop: ((navbar_height - logo_len)/2) + "px", 
                                marginBottom: ((navbar_height - logo_len)/2) + "px", marginLeft: ((navbar_height - logo_len)/2) + "px", marginRight: ((navbar_height - logo_len)/2) + "px"}}
                                className='valign'
                                />
                                <div className='brand-logo hide-on-med-and-down valign' style=
                                {{ fontSize: '17px', height: String(logo_len) + 'px',  marginTop: ((navbar_height - logo_len)/2) + "px", 
                                marginBottom: ((navbar_height - logo_len)/2) + "px", marginLeft: ((navbar_height - logo_len)/2) + "px",
                                 marginRight: ((navbar_height - logo_len)/2) + "px" }}>{this.props.title}</div>
                            </div>
                        </Link>
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