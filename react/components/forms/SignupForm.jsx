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
                    <Input className='datepicker' label='Date of Birth' type='date' name='bday' />
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

export default SignupForm;