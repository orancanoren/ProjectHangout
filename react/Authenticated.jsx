import React from 'react';
import ReactDOM from 'react-dom';
import { Switch, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar.jsx';
import Profile from './containers/Profile.jsx';
import Search from './containers/Search.jsx';

class Authenticated extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            profile_data: {},
            progress: 0,
            search_query: ''
        }
        this.getProfileData = this.getProfileData.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
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

    handleSearch(search_query) {
        this.setState({
            search_query: search_query
        });
    }

    componentDidMount() {
        this.getProfileData();
    }

    render() {
        return (
            <div>
                <header>
                    <Navbar title='Project Hangout' logged_in={true} search_handler={this.handleSearch} />
                </header>
                <main>
                    <Switch>
                        <Route exact path='/profile'>
                            <Profile data={this.state.profile_data}/>
                        </Route>
                        <Route exact path='/search'>
                            <Search query={this.state.search_query} />
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