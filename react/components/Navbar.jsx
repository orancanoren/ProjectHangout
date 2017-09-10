import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { ProgressBar, Icon, NavItem } from 'react-materialize';

class Navbar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect_target: ''
        }

        this.handleSearch = this.handleSearch.bind(this);
    }

    handleSearch(event) {
        event.preventDefault();

        const query = document.getElementById('search').value;
        console.log('handleSearch got:', query);
        
        if ( query == '' )
            return;

        this.props.search_handler(query);
        this.props.history.push('/search');
    }

    componentDidMount() {
        document.getElementById('search').value = '';
    }

    render() {
        var authButton;
        if (this.props.logged_in)
            authButton = <li><a href="/logout">Logout</a></li>;
        else
            authButton = <li><a href="/">Login</a></li>;

        const navbar_height = 44;
        const logo_len = 35;
        const normalizer = ((navbar_height - logo_len)/2);
        
        return (
            <nav className="light-blue darken-4" style={{ height: navbar_height }}>
                { this.state.redirect_target && <Redirect to={this.state.redirect_target} />}
                <div className="container">
                    <div className="nav-wrapper" style={{ lineHeight: navbar_height + 'px'}}>
                        <Link to='/profile' className='left'>
                            <div id='brand-logo'>
                                <img src="/assets/BrandLogo.png" 
                                style={{width: logo_len + 'px', height: logo_len + 'px', marginTop: normalizer + "px", 
                                marginBottom: normalizer + "px", marginLeft: normalizer + "px", marginRight: normalizer + "px"}}
                                className='valign'
                                />
                                <div className='brand-logo hide-on-med-and-down' style=
                                {{ fontSize: '17px', height: logo_len + 'px',  marginTop: normalizer + "px", 
                                marginBottom: normalizer + "px", marginLeft: normalizer + "px",
                                 marginRight: normalizer + "px", lineHeight: logo_len + 'px'}}>
                                    {this.props.title}</div>
                            </div>
                        </Link>
                        <ul id="nav-mobile" className="right">
                            <li key={1}>
                                <form onSubmit={this.handleSearch}>
                                    <div className="input-field">
                                        <input id="search" type="search" placeholder='Search' 
                                        style={{ width: '300px', height: logo_len, lineHeight: navbar_height,
                                        marginTop: normalizer + "px", marginBottom: normalizer + "px"
                                     }} />
                                    </div>
                                </form>
                            </li>
                            <li key={2}>{authButton}</li>
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

export default withRouter(Navbar);