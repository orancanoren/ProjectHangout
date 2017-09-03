import React from 'react';

class LoginBar extends React.Component {
    render() {
        return (
            <div className='navbar-fixed'>
                <nav className="light-blue darken-4" style={{height: '64px'}}>
                    <div className="container">
                        <div className='valign-wrapper' style={{height: '100%' }}>
                        <a href='/' className='left'>
                            <div id='brand-logo'>
                                <img src="/assets/BrandLogo.png" 
                                style={{width: "56px", height: "56px", marginTop: '4px', 
                                marginBottom: '4px', marginLeft: '4px', marginRight: '4px'}}
                                className='valign'
                                />
                                <span className='brand-logo hide-on-med-and-down valign'>Project Hangout</span>
                            </div>
                        </a>
                        </div>
                    </div>
                </nav>
            </div>
        );
    }
}
// <a href="/" className="brand-logo left" id="logo">{this.props.title}</a>
export default LoginBar;