import React from 'react';
import ReactDOM from 'react-dom';
import { Switch, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar.jsx';
import Profile from './containers/Profile.jsx';
import Search from './containers/Search.jsx';
import View from './containers/View.jsx';
import FollowView from './containers/FollowView.jsx';

class Authenticated extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            search_query: '',
            profile_data: null
        }
        
        this.handleSearch = this.handleSearch.bind(this);
        this.performToast = this.performToast.bind(this);
        this.getProfileData = this.getProfileData.bind(this);
        this.updateInfo = this.updateInfo.bind(this);
    }

    performToast(message) {
        Materialize.toast(message, 4000);
    }

    handleSearch(search_query) {
        this.setState({
            search_query: search_query
        });
    }

    getProfileData() {
        const request = {
            method: 'get',
            url: '/api/profile/'
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

    updateInfo() {
        console.log('before updateInfo:\n', this.state.profile_data);
        this.getProfileData();
        console.log('after updateInfo:\n', this.state.profile_data);
    }

    componentDidMount()  {
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
                        <Route path='/profile'>
                            <Profile data={this.state.profile_data}
                            handleToast={this.performToast}
                            updateInfo={this.updateInfo}/>
                        </Route>
                        <Route exact path='/search'>
                            <Search query={this.state.search_query} 
                            handleToast={this.performToast} />
                        </Route>
                        <Route path='/view/:target_email'>
                            <View handleToast={this.performToast} />
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