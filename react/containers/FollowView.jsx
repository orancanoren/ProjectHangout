import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import  { Preloader } from 'react-materialize';
import ViewCard from '../components/ViewCard.jsx';

class FollowView extends React.Component {
    render() {
        var render_element;
        if (this.props.data.length == 0) {
            render_element = <p className='center'>No data</p>
        }
        else {
            var view_cards = [];
            for (var i = 0; i < this.props.data.length; i++) {
                view_cards.push(<ViewCard key={i + 1} data={this.props.data[i]} />);
            }
            render_element = view_cards;
        }

        return (
            <div style={{ marginTop: '50px' }}>
                {render_element}
            </div>
        );
    }
}

FollowView.PropTypes = {
    data: PropTypes.array.isRequired,
    is_followers: PropTypes.bool
}

export default FollowView;