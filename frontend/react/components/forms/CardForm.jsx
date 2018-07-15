import React from 'react';
import PropTypes from 'prop-types';

class CardForm extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let fields = this.props.field;
        for (var i = 0; i < fields.length; i++) {
            
        }

        return (
            <div className="col s12 z-depth-6 card-panel transparent">
                <form method='POST' action={this.props.action}>
                    
                </form>
            </div>
        );
    }
}

function fieldPropValidator(fields) {
    if (typeof(fields != Array))
        return false;
}

CardForm.PropTypes = {
    action: PropTypes.string.isRequired,
    fields: PropTypes.arrayOf(fieldPropValidator)
};

export default CardForm;