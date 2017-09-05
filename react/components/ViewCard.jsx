import React from 'react';
import Navbar from '../components/Navbar.jsx';
import { Card } from 'react-materialize';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

class ViewCard extends React.Component {
    render() {
        var view_display;
        const profile_data = this.props.data;
        if (profile_data.fname) {
            profile_display =
            <Card className='small'>
                <Link to = {'view/' + profile_data.email}>{profile_data.fname} {profile_data.lname} </Link> <br />
                <span style={{fontSize: '17px', fontWeight: '300'}} 
                className='grey-text text-lighten-2'>Student at {profile_data.school}</span>}
            </Card>;
        }
        else {
            view_display = <Card className='small'>Loading</Card>;
        }

        return (
            <div>
                {view_display}
            </div>
        );
    }
}

ViewCard.PropTypes = {
    data: PropTypes.object.isRequired
}

export default ViewCard;