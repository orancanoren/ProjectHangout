import React from 'react';
import { Card, CardTitle } from 'react-materialize';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import axios from 'axios';
import FollowButton from './FollowButton.jsx';

class ProfileCard extends React.Component {
    componentDidMount() {
        if (this.props.updateInfo) {
            this.props.updateInfo();
        }
    }

    render() {
        // 1 - Get profile card
        const pathArray = window.location.href.split('/');
        const image_url = pathArray[0] + '//' + pathArray[2] + '/assets/profile_cover.jpg';

        const profile_index = '/' + (pathArray[3] == 'view' ? 'view/' + pathArray[4] + '/' : 'profile/');

        var renderedContent;
        if (this.props.data) {
            renderedContent =
            <Card
                className='medium'
                header={<CardTitle image={image_url}>
                    {this.props.data.fname} {this.props.data.lname} <br />
                    <span style={{fontSize: '17px', fontWeight: '300'}} 
                    className='grey-text text-lighten-2'>Student at {this.props.data.school}</span> </CardTitle>}
                
                actions={[
                    <Link to={profile_index} key={1}>Events</Link>,
                    <Link to={profile_index + 'followers'} key={2}>{this.props.data.followers.length} followers</Link>,
                    <Link to={profile_index + 'following'} key={3}>{this.props.data.following.length} following</Link>, 
                    this.props.follow_status && <FollowButton key={4} onClick={this.handleFollowClick}/>  
                ]}
                    
                style={{ width: '800px', height: '300px', margin: 'auto' }}
                    >
                <ul>
                    <li>{new Date(this.props.data.bday).toISOString().substring(0, 10)}</li>
                    <li>{this.props.data.sex}</li>
                </ul>
            </Card>;
        }
        else {
            renderedContent = <Card style={{ width: '800px', height: '300px', margin: 'auto' }} className='small'>Loading</Card>;
        }

        return (
            <div>
                {renderedContent}
            </div>
        );
    }
}

ProfileCard.PropTypes = {
    data: PropTypes.object.isRequired,
    updateInfo: PropTypes.object
}

export default ProfileCard;