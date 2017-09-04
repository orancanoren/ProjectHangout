import React from 'react';
import Navbar from '../components/Navbar.jsx';
import { Card, CardTitle } from 'react-materialize';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import axios from 'axios';

class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fname: '',
            lname: '',
            school: '',
            bday: null,
            sex: '',
            follower_count: null,
            following_count: null
        };

        this.getProfileData = this.getProfileData.bind(this);
    }

    getProfileData() {
        const request = {
            method: 'get',
            url: '/api/profile',
            onDownloadProgress: (progressEvent) => {
                console.log(progressEvent);
            }
        }

        // Same data will be used in other components, find a way of reducing DB access
        axios(request)
            .then((response) => {
                this.setState({
                    fname: response.data.fname,
                    lname: response.data.lname,
                    school: response.data.school,
                    bday: response.data.bday,
                    sex: response.data.sex,
                    follower_count: response.data.followers.length,
                    following_count: response.data.following.length
                })
            })
            .catch((err) => {
                console.error(err);
            });
    }

    componentDidMount() {
        this.getProfileData();
    }

    render() {
        return (
            <div>
                <Card 
                    className='small'
                    header={<CardTitle image='assets/profile_cover.jpg'>
                        {this.state.fname} {this.state.lname} <br />
                        <span style={{fontSize: '17px', fontWeight: '300'}} 
                        className='grey-text text-lighten-2'>Student at {this.state.school}</span> </CardTitle>}

                    actions={[<Link to='/followers'>{this.props.follower_count} followers</Link>,
                        <Link to='/following'>{this.props.following_count} following</Link>]}>
                    <ul>
                        <li>{new Date(this.state.bday).toISOString().substring(0, 10)}</li>
                        <li>{this.state.sex}</li>
                    </ul>
                </Card>
            </div>
        );
    }
}

export default Profile;