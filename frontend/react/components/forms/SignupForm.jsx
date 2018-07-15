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
            <div>
                <form action='/signup' method='POST'>
                        <Input label='First Name' name='fname' />
                    <Input label='Last Name' name='lname' />
                    <Input label='School' name='school' />
                    <Input className='datepicker' label='Date of Birth' type='date' name='bday' />
                    <Input label='Email' validate type='email' name='email_input'/>
                    <Input label='Password' validate type='password' name='password_input'/>
                    <Button waves='light' className="btn light-blue" 
                    type="submit" name="action">Submit</Button>
                </form>    
            </div>
        );
    }
}

export default SignupForm;