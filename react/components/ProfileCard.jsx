import React from 'react';
import Navbar from '../components/Navbar.jsx';
import { Card, CardTitle } from 'react-materialize';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

class ProfileCard extends React.Component {
    render() {
        const pathArray = window.location.href.split('/');
        const image_location = pathArray[0] + '//' + pathArray[2] + '/assets/profile_cover.jpg';

        var profile_display;
        const profile_data = this.props.data;
        if (profile_data) {
            console.log('Profile Card got data:\n', this.props.data);
            profile_display =
            <Card 
                className='small'
                header={<CardTitle image={image_location}>
                    {profile_data.fname} {profile_data.lname} <br />
                    <span style={{fontSize: '17px', fontWeight: '300'}} 
                    className='grey-text text-lighten-2'>Student at {profile_data.school}</span> </CardTitle>}
                
                actions={[<Link to='/followers' key={1}>{profile_data.followers.length} followers</Link>,
                    <Link to='/following' key={2}>{profile_data.following.length} following</Link>]}
                    
                style={{ width: '800px', height: '300px', margin: 'auto' }}
                    >
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

ProfileCard.PropTypes = {
    data: PropTypes.object.isRequired
}

export default ProfileCard;