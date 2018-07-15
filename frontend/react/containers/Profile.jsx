import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Row, Col, Preloader } from 'react-materialize';
import PropTypes from 'prop-types';
import ProfileCard from '../components/ProfileCard.jsx';
import CardList from './CardList.jsx';

class Profile extends React.Component {
    render() {
        return (
            <div>
                <div style={{ marginTop: '50px' }}>
                    <ProfileCard data={this.props.data}
                    updateInfo={this.props.updateInfo} />
                </div>
                <div style={{ marginTop: '50px' }}>
                    <Switch>
                        <Route exact path='/profile'>
                            <div className='center'>
                                Your events will show up here
                            </div>
                        </Route>
                        <Route exact path='/profile/circle'>
                            <div className='center'>
                                Your current circle will show up here
                            </div>
                        </Route>
                        <Route path='/profile/followers'>
                            <CardList emails={this.props.data && this.props.data.followers} 
                            handleToast={this.props.handleToast}
                            updateInfo={this.props.updateInfo}/>
                        </Route>
                        <Route path='/profile/following'>
                            <CardList emails={this.props.data && this.props.data.following}
                            handleToast={this.props.handleToast}
                            updateInfo={this.props.updateInfo}/>
                        </Route>
                    </Switch>
                </div>
            </div>
        );
    }
}

Profile.PropTypes = {
    data: PropTypes.object.isRequired,
    handleToast: PropTypes.func.isRequired,
    updateInfo: PropTypes.func.isRequired
}

export default Profile;