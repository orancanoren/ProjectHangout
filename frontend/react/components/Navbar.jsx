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
        $(".sideNavActivator").sideNav();

        $('.button-collapse').sideNav({
            menuWidth: 300, // Default is 300
            edge: 'right', // Choose the horizontal origin
            closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
            draggable: true, // Choose whether you can drag to open on touch screens,
          }
        );

        $(".dropdown-button").dropdown();

        $(".dropdown-button").dropdown({
            inDuration: 300,
            outDuration: 225,
            constrain_width: false, // Does not change width of dropdown to that of the activator
            hover: false, // Activate on click
            alignment: "right", // Aligns dropdown to left or right edge (works with constrain_width)
            belowOrigin: true,
          });
    }

    render() {
        const navbar_height = 44;
        const logo_len = 35;
        const normalizer = ((navbar_height - logo_len)/2);

        var notifs = [];
        if (this.props.notifications)
            for (var i = 0; i < this.props.notifications.length; i++) {
                var current_notif = '';
                var blob_counter = 0;
                for (var j = 0; j < this.props.notifications[i].notif_text.length; j++) {
                    if (this.props.notifications[i].notif_text[j] == '') {
                        current_notif += this.props.notifications[i].value_arr[blob_counter] + ' ';
                        blob_counter++;
                    }
                    else {
                        current_notif += this.props.notifications[i].notif_text[j];
                    }
                }
                
                notifs.push(<li key={i}><a>{current_notif}</a></li>)
            }

        return (
            <div>
                {/* 1 - NOTIFICATION DROPDOWN */}
                <ul id='notification-dropdown' className='dropdown-content'>
                    {notifs}
                </ul>

                {/* 2 - SIDE MENU */}
                <ul id="slide-out" className="side-nav">
                    <li><div className="user-view">
                        <a href="#!user">
                            <img className="circle" src="/assets/yuna.jpg" style={{
                                height: '80px',
                                width: '80px'
                            }}/>
                        </a>
                        <a href="#!name">
                            <span className="black-text name">
                                {this.props.profile_data && this.props.profile_data.fname + ' ' + this.props.profile_data.lname}
                            </span>
                        </a>
                        <br />
                        <a href="#!school"><span className="black-text email">
                            {this.props.profile_data && this.props.profile_data.school}
                        </span></a>
                        </div>
                    </li>
                    <li><a href="#!" className='waves-effect'><i className="material-icons">cloud</i>First Link With Icon</a></li>
                    <li><a href="#!">Some setting</a></li>
                    <li><div className="divider"></div></li>
                    <li><a className="subheader">Authentication</a></li>
                    <li><a className="" href="/logout">Logout</a></li>
                </ul>

                {/* 3 - NAVBAR CONTENT */}
                <nav className="light-blue darken-4" style={{ height: navbar_height }}>
                    { this.state.redirect_target && <Redirect to={this.state.redirect_target} />}
                    <div className="container">
                        <div className="nav-wrapper" style={{ lineHeight: navbar_height + 'px'}}>
                            {/* 3.1 - Project Hangout Banner */}
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

                            {/* 3.2 - Search Bar */}
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
                                <li key={2}>
                                    <a style={{ height: logo_len,
                                    marginTop: normalizer + 'px', marginBottom: normalizer + 'px'}}
                                    className='valign dropdown-button' data-activates='notification-dropdown'>
                                    {this.props.notifications && <div className="notifs" data-count={this.props.notifications.length}>
                                    <i className="material-icons" id="notif_icon">notifications</i>
                                    </div>}
                                    </a>
                                </li>
                                <li key={3}>
                                    { this.props.logged_in &&
                                        <a style={{ height: logo_len,
                                        marginTop: normalizer + 'px', marginBottom: normalizer + 'px'}}
                                        data-activates='slide-out' className='sideNavActivator'>
                                            menu
                                        </a>
                                    }
                                    { !this.props.logged_in &&
                                        <a href="/">Login</a>
                                    }
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        );
    }
}

Navbar.propTypes = {
    title: PropTypes.string.isRequired,
    logged_in: PropTypes.bool.isRequired,
    search_handler: PropTypes.func.isRequired,
    notifications: PropTypes.array,
    profile_data: PropTypes.object
};

export default withRouter(Navbar);