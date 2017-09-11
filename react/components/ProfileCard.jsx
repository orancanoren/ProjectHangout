import React from 'react';
import { Card, CardTitle } from 'react-materialize';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import axios from 'axios';
import FollowButton from './FollowButton.jsx';

class ProfileCard extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (this.props.updateInfo) {
            this.props.updateInfo();
        }
        console.log('this:', this);
    }

    render() {
        // 0 - Get image path [DURING DEBUG PROCEDURE]
        const pathArray = window.location.href.split('/');
        const image_location = pathArray[0] + '//' + pathArray[2] + '/assets/profile_cover.jpg';

        // 1 - Get profile card
        var renderedContent;
        if (this.props.data) {
            renderedContent =
            <Card
                className='medium'
                header={<CardTitle image={image_location}>
                    {this.props.data.fname} {this.props.data.lname} <br />
                    <span style={{fontSize: '17px', fontWeight: '300'}} 
                    className='grey-text text-lighten-2'>Student at {this.props.data.school}</span> </CardTitle>}
                
                actions={[<Link to='/profile/followers' key={1}>{this.props.data.followers.length} followers</Link>,
                    <Link to='/profile/following' key={2}>{this.props.data.following.length} following</Link>, 
                    this.props.follow_status && <FollowButton key={3} onClick={this.handleFollowClick}/>  ]}
                    
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