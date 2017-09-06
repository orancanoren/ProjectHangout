import React from 'react';
import ProfileCard from '../components/ProfileCard.jsx';
import { Row, Col } from 'react-materialize';

class Profile extends React.Component {
    render() {
        return (
            <div style={{ marginTop: '50px' }}>
                <ProfileCard data = {this.props.data} />
            </div>
        );
    }
}

export default Profile;