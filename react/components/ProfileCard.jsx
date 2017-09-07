import React from 'react';
import { Card, CardTitle } from 'react-materialize';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import FollowButton from './FollowButton.jsx';

class ProfileCard extends React.Component {
    constructor(props) {
        super(props);

        this.handleFollowClick = this.handleFollowClick.bind(this);
    }

    handleFollowClick() {
        console.log('follow request!');
    }

    componentDidMount() {
        this.props.updateProfileData();
    }

    render() {
        const pathArray = window.location.href.split('/');
        const image_location = pathArray[0] + '//' + pathArray[2] + '/assets/profile_cover.jpg';

        var profile_display;
        const profile_data = this.props.data;
        if (profile_data) {
            profile_display =
            <Card 
                className='medium'
                header={<CardTitle image={image_location}>
                    {profile_data.fname} {profile_data.lname} <br />
                    <span style={{fontSize: '17px', fontWeight: '300'}} 
                    className='grey-text text-lighten-2'>Student at {profile_data.school}</span> </CardTitle>}
                
                actions={[<Link to='/followers' key={1}>{profile_data.followers.length} followers</Link>,
                    <Link to='/following' key={2}>{profile_data.following.length} following</Link>, 
                    this.props.follow_status && <FollowButton key={3} onClick={this.handleFollowClick}/>  ]}
                    
                style={{ width: '800px', height: '300px', margin: 'auto' }}
                    >
                <ul>
                    <li key={1}>{new Date(profile_data.bday).toISOString().substring(0, 10)}</li>
                    <li key={2}>{profile_data.sex}</li>
                </ul>
            </Card>;
            
        }
        else {
            profile_display = <Card style={{ width: '800px', height: '300px', margin: 'auto' }} className='small'>Loading</Card>;
        }

        return (
            <div>
                {profile_display}
            </div>
        );
    }
}

ProfileCard.PropTypes = {
    data: PropTypes.object.isRequired,
    follow_status: PropTypes.bool
}

export default ProfileCard;