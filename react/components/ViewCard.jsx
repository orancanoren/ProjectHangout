import React from 'react';
import Navbar from '../components/Navbar.jsx';
import { Card, Button, Row, Col, Preloader } from 'react-materialize';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import FollowButton from './FollowButton.jsx';
import axios from 'axios';
import update from 'immutability-helper';

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
            data_pending: true,
            follow_status_pending: false,
            data: null
        }

        this.handleFollowAction = this.handleFollowAction.bind(this);
    }

    fetchTargetData(email) {
        axios.get('/api/card/'  + email)
            .then((response) => {
                this.setState({
                    data_pending: false,
                    data: response.data
                });
            })
            .catch((err) => {
                console.error(err);
            });
    }

    handleFollowAction(unfollow, targetEmail, target_name) {
        this.setState({
            follow_status_pending: true
        });

        const url = unfollow ? '/api/unfollow' : '/api/follow';

        axios.post(url, {
            target_email: targetEmail
        })
        .then((response) => {
            if (!response.data.success) {
                console.error('Error with successful response:\n',response.data.error);
                this.props.handleToast('Cannot perform this action!');
            }
            else {
                // SUCCESS!
                this.props.handleToast(unfollow ? 'Unfollowed ' + target_name : 'Following ' + target_name);
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

    componentDidMount() {
        this.fetchTargetData(this.props.targetEmail);
    }

    componentWillReceiveProps(nextProps) {
        console.log('nextProps.targetEmail:', nextProps.targetEmail);
        this.fetchTargetData(nextProps.targetEmail);
    }

    render() {
        // 1 - Prepare the FollowButton
        var follow_button;
        if (this.state.data && this.state.data.authData && !this.state.follow_status_pending) {
            if (this.state.data.authData.distance == 1) {
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

        // 2 - Prepare the ViewCard
        var renderedContent;
        const distance = this.state.data ? this.state.data.authData.distance : null;
        if (!this.state.data_pending) {
            renderedContent =
            <Card style={{ height: '100px', width: '600px', margin: 'auto'}}>
                <Row>
                    <Col s={9}>
                        <Link to = {'view/' + this.props.targetEmail}>
                            <span  style={{ float: 'left', fontWeight: 400 }}>{this.state.data.fname} {this.state.data.lname}</span>
                        </Link>
                    </Col>
                    <Col s={3}>
                    {
                        this.state.data.authData &&
                        <span style={{ float: 'right' }}>
                            { follow_button }
                        </span>
                    }
                    </Col>
                    <Col s={9}>
                        <span style={{fontSize: '17px', fontWeight: '300'}} 
                            className='grey-text'>Student at {this.state.data.school}
                        </span>
                    </Col>
                    <Col s={3}>
                    { distance > 1 &&
                        <div style={{ float: 'right' }}>
                            distance: {distance}
                        </div>
                    }
                    </Col>
                </Row>
            </Card>;
        }
        else {
            renderedContent = <Card style={{ width: '600px', height: '100px', margin: 'auto' }} className='small'>Loading</Card>;
        }

        return (
            <div>
                {renderedContent}
            </div>
        );
    }
}

ViewCard.PropTypes = {
    targetEmail: PropTypes.object.isRequired,
    handleToast: PropTypes.func.isRequired
}

export default ViewCard;