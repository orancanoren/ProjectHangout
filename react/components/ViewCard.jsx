import React from 'react';
import Navbar from '../components/Navbar.jsx';
import { Card, Button, Row, Col } from 'react-materialize';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import FollowButton from './FollowButton.jsx';
import axios from 'axios';

class ViewCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            follow_status: this.props.data.distance == 1 ? true : false
        }

        this.handleFollowAction = this.handleFollowAction.bind(this);
    }

    handleFollowAction(unfollow, target_email) {
        const url = unfollow ? '/api/unfollow' : '/api/follow';

        axios.post(url, {
            target_email: target_email
        })
        .then((response) => {
            console.log('response:\n', response);
            if (!response.data.success) {
                console.error('Error with successful response:\n',response.data.error);
            }
            else {
                this.setState({
                    follow_status: url == '/api/follow' ? true : false
                });
            }
        })
        .catch((err) => {
            console.error('Error for response:', response.data.error);
        });
    }

    render() {
        var view_display;
        const profile_data = this.props.data;
        const distance = profile_data.distance && profile_data.distance > 0 ? 
            profile_data.distance : null;

        var follow_button;
        if (this.props.follow_enabled) {
            if (this.state.follow_status) {
                follow_button = <FollowButton unfollow onClick={ () => {this.handleFollowAction(true, profile_data.email)} } />
            }
            else {
                follow_button = <FollowButton onClick={ () => {this.handleFollowAction(false, profile_data.email)} } />
            }
        }
        
        if (profile_data.fname) {
            view_display =
            <Card style={{ height: '100px', width: '600px', margin: 'auto'}}>
                <Row>
                    <Col s={9}>
                        <Link to = {'view/' + profile_data.email}>
                            <span  style={{ float: 'left', fontWeight: 400 }}>{profile_data.fname} {profile_data.lname}</span>
                        </Link>
                    </Col>
                    <Col s={3}>
                    {
                        this.props.follow_enabled &&
                        <span style={{ float: 'right' }}>
                            { follow_button }
                        </span>
                    }
                    </Col>
                    <Col s={9}>
                        <span style={{fontSize: '17px', fontWeight: '300'}} 
                            className='grey-text'>Student at {profile_data.school}
                        </span>
                    </Col>
                    <Col s={3}>
                    { distance > 1 &&
                        <div style={{ float: 'right' }}>
                            distance: {profile_data.distance}
                        </div>
                    }
                    </Col>
                </Row>
            </Card>;
        }
        else {
            view_display = <Card style={{ width: '800px', height: '300px', margin: 'auto' }} className='small'>Loading</Card>;
        }

        return (
            <div>
                {view_display}
            </div>
        );
    }
}

ViewCard.PropTypes = {
    data: PropTypes.object.isRequired,
    handleFollowStatusChange: PropTypes.func,
    follow_enabled: PropTypes.bool.isRequired,
    distance: PropTypes.bool
}

export default ViewCard;