import React from 'react';
import { Button } from 'react-materialize';

const style = { height: '30px', width: '90px' }
const fontStyle = { lineHeight: '30px', fontSize: '12px', marginRight: '3px', marginLeft: '3px'}

class FollowButton extends React.Component {
    render() {
        var button;
        if (this.props.unfollow) {
            button =
            <Button style={style} className='red accent-3'>
                <span style={fontStyle}>UNFOLLOW</span>
            </Button>;
        }
        else {
            button =
            <Button style={style} className='blue'>
                <span style={fontStyle}>FOLLOW</span>
            </Button>;
        }

        return button;
    }
}

export default FollowButton;