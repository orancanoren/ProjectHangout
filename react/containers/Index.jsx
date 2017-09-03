import React from 'react';
import LoginForm from '../components/forms/LoginForm.jsx';
import Navbar from '../components/Navbar.jsx';
import FlashMessage from '../components/FlashMessage.jsx';
import getData from '../API/getData';
import axios from 'axios';
import LoginBar from '../components/LoginBar.jsx';

class Index extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            local_data: null
        }

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        console.log('click!');
        axios.get('http://localhost:3000/api/mydata/15')
            .then(res => {
                this.setState({
                    local_data: res.data.data
                });
            });
    }

    render() {
        var displayed_item;
        if (this.state.local_data) {
            displayed_item = this.state.local_data;
        }
        else {
            displayed_item = <a onClick={this.handleClick}>get data!</a>;
        }

        return (
            <div>
                <header>
                    <LoginBar />
                </header>
                <main>
                    <div className='valign-wrapper bg'>
                    <video id="bgvid" playsInline autoPlay muted loop>
                        <source src="/assets/background.mp4" type="video/mp4" />
                    </video>
                        <div className='valign centered-content center'>
                            <div>
                                <h2 id='title'>Project Hangout</h2>
                                <h5 id="sub">Redefining the Network</h5>
                                <div style={{width: '400px', height: '500px'}}>
                                    <LoginForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <FlashMessage />
            </div>
        );
    }
}
/*
<div className="row center valign-wrapper">
                        <div className='valign'>
                            <div className="col s12" style={{backgroundColor: 'red'}}>
                                <h2 id="title">Project Hangout</h2>
                            </div>
                            <div className="col s12" style={{backgroundColor: 'orange'}}>
                                <h5 className="grey-text text-darken-3" id="auth">Redefining the Network</h5>
                            </div>
                            <div className="col s12 offset-s4">
                                <div style={{width: '400px', height: '500px'}}>
                                    <LoginForm />
                                </div>
                            </div>
                        </div>
                    </div>*/

export default Index;