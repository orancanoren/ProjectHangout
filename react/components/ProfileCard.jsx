import React from 'react';
import { Card, CardTitle } from 'react-materialize';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import axios from 'axios';
import FollowButton from './FollowButton.jsx';

class ProfileCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            follow_status_pending: false
        }
    }

    componentDidMount() {
        if (this.props.updateInfo) {
            this.props.updateInfo();
        }
    }

    render() {
        // 0 - Prepare the link URL's
        const pathArray = window.location.href.split('/');
        const image_url = pathArray[0] + '//' + pathArray[2] + '/assets/profile_cover.jpg';

        const profile_index = '/' + (pathArray[3] == 'view' ? 'view/' + pathArray[4] + '/' : 'profile/');

        // 1 - Prepare the FolloButton
        var follow_button = null;
        if (this.props.follow_status && !this.state.follow_status_pending && this.props.authData) {
            if (this.props.data.authData.distance == 1) {
                follow_button = <FollowButton unfollow onClick={ () => {this.handleFollowAction(true, this.props.targetEmail, this.state.data.fname)} } />
            }
            else {
                follow_button = <FollowButton onClick={ () => {this.handleFollowAction(false, this.props.targetEmail, this.state.data.fname)} } />
            }
        }
        else if (this.state.follow_status_pending) {
            follow_button = <div className='center'>
                <Preloader size='small' /></div>;
        }

        // 2 - Prepare the ProfileCard
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
                    {new Date(this.props.data.bday).toISOString().substring(0, 10)}
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
    updateInfo: PropTypes.object,
    follow_status: PropTypes.bool
}

export default ProfileCard;