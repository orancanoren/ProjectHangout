import React from 'react';
import ProfileCard from '../components/ProfileCard.jsx';
import { Row, Col } from 'react-materialize';

class Profile extends React.Component {
    render() {
        return (
            <div>
                <Row>
                    <Col s={6} offset='s3'>
                        <ProfileCard data = {this.props.data}/>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default Profile;