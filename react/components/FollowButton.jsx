import React from 'react';
import { Button } from 'react-materialize';
import PropTypes from 'prop-types';

const style = { height: '30px', width: '120px' }
const fontStyle = { lineHeight: '30px', fontSize: '12px', marginRight: '3px', marginLeft: '3px'}

class FollowButton extends React.Component {
    render() {
        var cname;
        var text;
        if (this.props.unfollow) {
            cname = 'red accent-3';
            text = 'UNFOLLOW';
        }
        else {
            cname = 'blue';
            text = 'FOLLOW';
        }

        return (
            <Button onClick={this.props.onClick} style={style} className={cname}>
                <span style={fontStyle}>{text}</span>
            </Button>
        );
    }
}

FollowButton.PropTypes = {
    unfollow: PropTypes.bool,
    onClick: PropTypes.func
}

export default FollowButton;