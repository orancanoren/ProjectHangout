import React from 'react';
import { Button } from 'react-materialize';

const style = { height: '30px', width: '90px' }
const fontStyle = { lineHeight: '30px', fontSize: '12px', marginRight: '3px', marginLeft: '3px'}

class FollowButton extends React.Component {

    render() {
        return (
            <Button style={style} className='red accent-3'>
                <span style={fontStyle}>UNFOLLOW</span>
            </Button>
        );
    }
}

// { !this.props.unfollow && <Button className='blue'>FOLLOW</Button> }

export default FollowButton;