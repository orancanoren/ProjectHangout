import React from 'react';
import Navbar from './components/Navbar.jsx';
import { Switch, Route } from 'react-router-dom';
import Profile from './containers/Profile.jsx';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

class Authenticated extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            profile_data: {},
            progress: 0
        }
        this.getProfileData = this.getProfileData.bind(this);
    }

    getProfileData() {
        const request = {
            method: 'get',
            url: '/api/profile',
            onDownloadProgress: (progressEvent) => {
                this.setState({
                    progress: progressEvent.loaded / progressEvent.total
                })
            }
        }

        axios(request)
            .then((response) => {
                this.setState({
                    profile_data: response.data
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
                <header>
                    <Navbar title='Project Hangout' logged_in={true} progress={this.state.progress}/>
                </header>
                <main>
                    <Switch>
                        <Route exact path='/profile'>
                            <Profile data={this.state.profile_data}/>
                        </Route>
                    </Switch>
                </main>
            </div>
        )
    }
}

ReactDOM.render((
    <BrowserRouter>
        <Authenticated />
    </BrowserRouter>
    ), document.getElementById('react-app'));