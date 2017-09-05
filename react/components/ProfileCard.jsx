import React from 'react';
import Navbar from '../components/Navbar.jsx';
import { Card, CardTitle } from 'react-materialize';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import axios from 'axios';

class Profile extends React.Component {
    render() {
        var profile_display;
        const profile_data = this.props.data;
        if (profile_data.fname) {
            profile_display =
            <Card 
                className='small'
                header={<CardTitle image='assets/profile_cover.jpg'>
                    {profile_data.fname} {profile_data.lname} <br />
                    <span style={{fontSize: '17px', fontWeight: '300'}} 
                    className='grey-text text-lighten-2'>Student at {profile_data.school}</span> </CardTitle>}

                actions={[<Link to='/followers' key={1}>{this.props.follower_count} followers</Link>,
                    <Link to='/following' key={2}>{this.props.following_count} following</Link>]}>
                <ul>
                    <li key={1}>{new Date(profile_data.bday).toISOString().substring(0, 10)}</li>
                    <li key={2}>{profile_data.sex}</li>
                </ul>
            </Card>;
            
        }
        else {
            profile_display = <Card className='small'>Loading</Card>;
        }

        return (
            <div>
                {profile_display}
            </div>
        );
    }
}

Profile.PropTypes = {
    data: PropTypes.object.isRequired
}

export default Profile;