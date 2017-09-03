import React from 'react';
import { CardPanel, Col, Row, Input, Button } from 'react-materialize'

class SignupForm extends React.Component {
    componentDidMount () {
        console.log('component mounted!!')
        $('.datepicker').pickadate({
          selectMonths: true, // Creates a dropdown to control month
          selectYears: 15 // Creates a dropdown of 15 years to control year
        });
      };

    render() {
        return (
            <CardPanel className='transparent'>
                <form action='/' method='POST'>
                    <Row><Col s={12}>
                        <Input label='First Name' name='fname' />
                    </Col></Row>
                    <Row><Col s={12}>
                    <Input label='Last Name' name='lname' />
                    </Col></Row>
                    <Row><Col s={12}>
                    <Input label='School' name='school' />
                    </Col></Row>
                    <Row><Col s={12}>
                    <Input className='datepicker' label='Date of Birth' type='date' />
                    </Col></Row>
                    <Row><Col s={12}>
                    <Input label='Email' validate type='email' name='email_input'/>
                    </Col></Row>
                    <Row><Col s={12}>
                    <Input label='Password' validate type='password' name='password_input'/>
                    </Col></Row>
                    <Row><Col s={12}>
                        <Button waves='light' className="btn light-blue" 
                        type="submit" name="action">Submit</Button>
                    </Col></Row>
                </form>    
            </CardPanel>
        );
    }
}
/*
<div className="col s12 z-depth-6 card-panel transparent">
<form action="/signup" method="POST">
<div className="row">
    <div className="input-field col s12">
        <input name="fname" type="text" />
        <label for="fname">First Name</label>
    </div>
    <div className="input-field col s12">
        <input name="lname" type="text" />
        <label for="lname">Last Name</label>
    </div>
    <div className="input-field col s12">
        <input name="school" type="text" />
        <label for="school">School</label>
    </div>
    <div className="input-field col s12">
        <input name="email_input" type="email" className="validate" />
        <label for="email_input" data-error="wrong email" data-success="correct">Email</label>
    </div>
    <div className="input-field col s12">
        <input name="password_input" type="password" />
        <label for="password_input">Password</label>
    </div>
    <div className="input-field col s12">
        <input name="bday" type="date" className="datepicker" />
        <label for="bday">Date of Birth</label>
    </div>
    <div className="col s12">
        Sex
        <p>
            <input name="sex" type="radio" id="male" value="Male" />
            <label for="male">Male</label> 
        </p>
        <p>
            <input name="sex" type="radio" id="female" value="Female" />
            <label for="female">Female</label>
        </p>
    </div>
    <div className="col s12">
        <button className="btn waves-effect waves-light light-blue" type="submit" name="action">Submit</button>
    </div>
</div>
</form>
</div>*/

export default SignupForm;