import React from 'react';
import Navbar from './components/Navbar.jsx';
import { Switch, Route } from 'react-router-dom';
import Profile from './containers/Profile.jsx';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

class Authenticated extends React.Component {
    render() {
        return (
            <div>
                <header>
                    <Navbar title='Project Hangout' logged_in={true} />
                </header>
                <main>
                    <Switch>
                        <Route exact path='/profile'>
                            <Profile />
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