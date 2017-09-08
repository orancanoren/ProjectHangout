import React from 'react';
import Navbar from '../components/Navbar.jsx';
import { Card, Button, Row, Col, Preloader } from 'react-materialize';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import FollowButton from './FollowButton.jsx';
import axios from 'axios';

/*
The ViewCard is supplied a `targetEmail` prop for which it is aimed to render the data of
the user with the email provided. If the card is rendered for an authorized user, then
an extra prop, namely `selfData`, is passed to the component so that additional info and
subcomponents such as the FollowButton can be rendered with respect to this data.
*/

class ViewCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            follow_status: this.props.data.distance == 1 ? true : false,
            follow_status_pending: false
        }

        this.handleFollowAction = this.handleFollowAction.bind(this);
    }

    fetchTargetData() {
        var request;
        if (this.props.self_data) {

        }
        else {

        }
    }

    handleFollowAction(unfollow, target_email, target_name) {
        this.setState({
            follow_status_pending: true
        });

        const url = unfollow ? '/api/unfollow' : '/api/follow';

        axios.post(url, {
            target_email: target_email
        })
        .then((response) => {
            if (!response.data.success) {
                console.error('Error with successful response:\n',response.data.error);
                this.props.handleToast('Cannot perform this action!');
            }
            else {
                // SUCCESS!
                this.setState({
                    follow_status: url == '/api/follow' ? true : false,
                });
                this.props.handleToast(unfollow ? 'Unfollowed ' + target_name : 'Following ' + target_name);
            }
            this.setState({
                follow_status_pending: false
            });
        })
        .catch((err) => {
            console.error('Error for response:', response.data.error);
            this.props.handleToast('Something has gone wrong!');
            this.setState({
                follow_status_pending: false
            });
        });
    }

    componentDidMount() {
        fetchTargetData();
    }

    render() {
        var follow_button;
        if (this.props.follow_enabled && !this.state.follow_status_pending) {
            if (this.state.follow_status) {
                follow_button = <FollowButton unfollow onClick={ () => {this.handleFollowAction(true, this.props.data.email)} } />
            }
            else {
                follow_button = <FollowButton onClick={ () => {this.handleFollowAction(false, profile_data.email)} } />
            }
        }
        else if (this.state.follow_status_pending) {
            follow_button = <div className='center'>
                <Preloader size='small' /></div>;
        }

        var renderedContent;
        const distance = this.props.data.distance && this.props.data.distance > 0 ? 
            this.props.data.distance : null;
        if (profile_data.fname) {
            renderedContent =
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
    target_data: PropTypes.object.isRequired,
    self_data: PropTypes.object,
    handleFollowStatusChange: PropTypes.func,
    handleToast: PropTypes.func
}

export default ViewCard;