import React from 'react';
import { Link } from 'react-router-dom';

class LoginBar extends React.Component {
    render() {
        const navbar_height = 64;
        const logo_len = 58;
        return (
            <div className='navbar-fixed' style={{ height: String(navbar_height) + 'px' }}>
                <nav className="light-blue darken-4" style={{ height: String(navbar_height) + 'px' }}>
                    <div className="container">
                        <div className='valign-wrapper' style={{ height: '100%' }}>
                        <Link to='/' className='left'>
                            <div id='brand-logo'>
                                <img src="/assets/BrandLogo.png" 
                                style={{width: String(logo_len) + 'px', height: String(logo_len) + 'px', marginTop: ((navbar_height - logo_len)/2) + "px", 
                                marginBottom: ((navbar_height - logo_len)/2) + "px", marginLeft: ((navbar_height - logo_len)/2) + "px", marginRight: ((navbar_height - logo_len)/2) + "px"}}
                                className='valign'
                                />
                                <div className='brand-logo hide-on-med-and-down valign' style=
                                {{ fontSize: '17px', height: String(logo_len) + 'px',  marginTop: ((navbar_height - logo_len)/2) + "px", 
                                marginBottom: ((navbar_height - logo_len)/2) + "px", marginLeft: ((navbar_height - logo_len)/2) + "px",
                                 marginRight: ((navbar_height - logo_len)/2) + "px" }}>Project Hangout</div>
                            </div>
                        </Link>
                        </div>
                    </div>
                </nav>
            </div>
        );
    }
}
// <a href="/" className="brand-logo left" id="logo">{this.props.title}</a>
export default LoginBar;