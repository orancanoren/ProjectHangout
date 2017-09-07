import React from 'react';
import ProfileCard from '../components/ProfileCard.jsx';
import axios from 'axios';

class View extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            profile_data: null
        }
    }

    getViewData(target_email) {
        const request = {
            method: 'get',
            url: '/api/view/' + target_email,
        }

        axios(request)
            .then((response) => {
                console.log('axios response:\n', response);
                this.setState({
                    profile_data: response.data
                });
            })
            .catch((err) => {
                console.error(err);
            });
    }

    componentDidMount() {
        console.log('this.props:\n', this.props);
        this.getViewData(this.props.match.params.target_email);
    }

    render() {
        return (
            <div style={{ marginTop: '50px' }}>
                <ProfileCard follow_status data={this.state.profile_data} />
            </div>
        );
    }
}

export default View;