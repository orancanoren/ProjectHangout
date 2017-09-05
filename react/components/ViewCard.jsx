import React from 'react';
import Navbar from '../components/Navbar.jsx';
import { Card, Button } from 'react-materialize';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import FollowButton from './FollowButton.jsx';

class ViewCard extends React.Component {
    render() {
        var view_display;
        const profile_data = this.props.data;
        if (profile_data.fname) {
            view_display =
            <Card style={{ height: '100px', width: '600px', margin: 'auto'}}>
                <Link to = {'view/' + profile_data.email}>
                    <span  style={{ float: 'left', fontWeight: 400 }}>{profile_data.fname} {profile_data.lname}</span></Link>
                    <span style={{ float: 'right' }}><FollowButton /></span>
                    <br />
                <span style={{fontSize: '17px', fontWeight: '300'}} 
                className='grey-text'>Student at {profile_data.school}</span>
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