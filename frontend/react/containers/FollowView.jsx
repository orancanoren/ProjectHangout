import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import  { Preloader } from 'react-materialize';
import CardList from './CardList.jsx';

class FollowView extends React.Component {
    render() {
        var renderedContent;
        if (this.props.data.length == 0) {
            renderedContent = <p className='center'>No data</p>
        }
        else {
            renderedContent = <CardList emails={this.props.data}
                                handleToast={this.props.handleToast} />;
        }

        return (
            <div style={{ marginTop: '50px' }}>
                {renderedContent}
            </div>
        );
    }
}

FollowView.PropTypes = {
    data: PropTypes.array.isRequired,
    handleToast: PropTypes.func.isRequired
}

export default FollowView;