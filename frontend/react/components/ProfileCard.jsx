import React from 'react';
import { Card, CardTitle, Preloader } from 'react-materialize';
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

        this.handleFollowAction = this.handleFollowAction.bind(this);
    }

    componentDidMount() {
        this.props.updateInfo();
    }

    handleFollowAction(unfollow) {
        this.setState({
            follow_status_pending: true
        });

        const url = unfollow ? '/api/unfollow' : '/api/follow';

        axios.post(url, {
            target_email: this.props.email
        })
        .then((response) => {
            if (!response.data.success) {
                console.error('Error with successful response:\n',response.data.error);
                this.props.handleToast('Cannot perform this action!');
                this.setState({
                    follow_status_pending: true
                });
            }
            else {
                // SUCCESS!
                this.props.handleToast(unfollow ? 'Unfollowed ' + this.props.data.fname : 'Following ' + this.props.data.fname);
                if (this.props.updateInfo) {
                    this.props.updateInfo();
                }
            }
            this.setState({
                follow_status_pending: false
            });
        })
        .catch((err) => {
            console.error('Error for response:', err);
            this.props.handleToast('Something has gone wrong!');
            this.setState({
                follow_status_pending: false
            });
        });
    }

    render() {
        // 0 - Prepare the link URL's
        const pathArray = window.location.href.split('/');
        const image_url = pathArray[0] + '//' + pathArray[2] + '/assets/profile_cover.jpg';

        const profile_index = '/' + (pathArray[3] == 'view' ? 'view/' + pathArray[4] + '/' : 'profile/');

        // 1 - Prepare the FollowButton
        var follow_button = null;
        // POSSIBLE BUG BELOW - CONDITION IS MET BY DISRTANCE DATA
        if (!this.state.follow_status_pending && this.props.data && this.props.data.distance != null) {
            if (this.props.data.distance == 1) {
                follow_button = <FollowButton unfollow onClick={ () => {this.handleFollowAction(true)} } />;
            }
            else {
                follow_button = <FollowButton onClick={ () => {this.handleFollowAction()} } />;
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
                    <Link to={profile_index + 'circle'} key={2}>Circle</Link>,
                    <Link to={profile_index + 'followers'} key={3}>{this.props.data.followers.length} followers</Link>,
                    <Link to={profile_index + 'following'} key={4}>{this.props.data.following.length} following</Link>, 
                    <span key={5}>{follow_button}</span>
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
    updateInfo: PropTypes.func.isRequired,
    email: PropTypes.string.isRequired
}

export default ProfileCard;