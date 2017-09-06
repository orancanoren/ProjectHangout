import React from 'react';
import LoginForm from '../components/forms/LoginForm.jsx';
import axios from 'axios';
import LoginBar from '../components/LoginBar.jsx';
import { Toast } from 'react-materialize';

class Index extends React.Component {
    constructor(props) {
        super(props);

        this.performToast = this.performToast.bind(this);
    }

    performToast(message) {
        Materialize.toast(message, 4000);
    }

    render() {
        return (
            <div>
                <div className='valign-wrapper bg'>
                    <div className='valign centered-content center'>
                        <div>
                            <h2 id='title'>Project Hangout</h2>
                            <h5 id="sub">Redefining the Network</h5>
                            <div className='frosted_card'>
                                <LoginForm handleToast={this.performToast} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Index;