import React from 'react';
import PropTypes from 'prop-types';
import ViewCard from '../components/ViewCard.jsx';

/*
To be used in Search and FollowView
-----------------------------------
CardList is provided a prop, an array of objects with `email` key for
which a ViewCard will be rendered. The cards are rendered in the array order.
*/

class CardList extends React.Component {
    constructor(props) {
        super(props);

        this.updateAllCards = this.updateAllCards.bind(this);
    }

    updateAllCards() {
        this.props.updateInfo();
    }

    render() {
        var renderedContent;

        var view_cards = []; // USING A LINKED LIST IS BETTER HERE
        for (var i = 0; i < this.props.emails.length; i++) {
            view_cards.push(<ViewCard key={i + 1} 
                targetEmail={this.props.emails[i].email} 
                handleToast={this.props.handleToast} 
                updateInfo={this.updateAllCards}/>);
        }
        renderedContent = view_cards;

        return (
            <div>
                { renderedContent }
            </div>
        );
    }
}

CardList.PropTypes = {
    emails: PropTypes.array.isRequired,
    handleToast: PropTypes.func.isRequired,
    updateInfo: PropTypes.func.isRequired
}

export default CardList;    