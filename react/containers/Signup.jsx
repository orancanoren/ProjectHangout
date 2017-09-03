import React from 'react';
import LoginBar from '../Components/LoginBar.jsx';
import SignupForm from '../Components/Forms/SignupForm.jsx';

class Signup extends React.Component {
    render() {
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
                                    <SignupForm />
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