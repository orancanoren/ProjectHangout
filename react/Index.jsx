import React from 'react';
import LoginBar from './components/LoginBar.jsx';
import Signup from './containers/Signup.jsx';
import Index from './containers/Index.jsx';
import { Switch, Route } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

class App extends React.Component {
    render() {
        return (
            <div>
                <LoginBar />
                <Switch>
                    <Route exact path='/'>
                        <Index />
                    </Route>
                    <Route exact path='/signup'>
                        <Signup />
                    </Route>
                </Switch>
            </div>
        );
    }
}

/*

*/

ReactDOM.render((
    <BrowserRouter>
        <App />
    </BrowserRouter>
    ), document.getElementById('react-app'));