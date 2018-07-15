import React from 'react';
import SignupForm from '../components/forms/SignupForm.jsx';

class Signup extends React.Component {
    render() {
        console.log('rendering Signup');
        return (
            <div>
                <div className='valign-wrapper bg'>
                    <div className='valign centered-content center'>
                        <div>
                            <h2 id='title'>Project Hangout</h2>
                            <h5 id="sub">Redefining the Network</h5>
                            <div className='frosted_card'>
                                <SignupForm handleToast={this.performToast} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Signup;