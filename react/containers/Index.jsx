import React from 'react';
import LoginForm from '../components/forms/LoginForm.jsx';
import axios from 'axios';
import LoginBar from '../components/LoginBar.jsx';
import { Toast } from 'react-materialize';

class Index extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            local_data: null
        }
        
        this.handleFlashback = this.handleFlashback.bind(this);
    }

    handleFlashback(toast) {
        <Toast toast={toast} />
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
                <div className='valign-wrapper bg'>

                    <div className='valign centered-content center'>
                        <div>
                            <h2 id='title'>Project Hangout</h2>
                            <h5 id="sub">Redefining the Network</h5>
                            <div style={{width: '400px', height: '500px'}}>
                                <LoginForm handleFlashback={this.handleFlashback}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Index;