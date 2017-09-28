import React from 'react';
import axios from 'axios';
import { Switch, Route } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard.jsx';
import CardList from './CardList.jsx';

class View extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null
        }
    }

    getViewData(target_email) {
        const request = {
            method: 'get',
            url: '/api/view/' + target_email,
        }

        axios(request)
            .then((response) => {
                this.setState({
                    data: response.data
                });
            })
            .catch((err) => {
                console.error(err);
            });
    }

    componentDidMount() {
        this.getViewData(this.props.match.params.target_email);
    }

    componentWillReceiveProps(newProps) {
        this.getViewData(newProps.match.params.target_email);
    }

    render() {
        return (
            <div>
                <div style={{ marginTop: '50px' }}>
                    <ProfileCard handleToast={this.props.handleToast}
                    data={this.state.data}
                    updateInfo={() => this.getViewData(this.props.match.params.target_email)}
                    email={this.props.match.params.target_email} />
                </div>
                <div style={{ marginTop: '50px' }}>
                    <Switch>
                        <Route exact path='/view/:target'>
                            <div className='center'>
                                Events will show up here
                            </div>
                        </Route>
                        <Route exact path='/view/:target/followers'>
                            <CardList emails={this.state.data && this.state.data.followers} 
                            handleToast={this.props.handleToast}
                            updateInfo={() => this.getViewData(this.props.match.params.target_email)}/>
                        </Route>
                        <Route exact path='/view/:target/following'>
                            <CardList emails={this.state.data && this.state.data.following}
                            handleToast={this.props.handleToast}
                            updateInfo={() => this.getViewData(this.props.match.params.target_email)}/>
                        </Route>
                    </Switch>
                </div>
            </div>
        );
    }
}

export default View;