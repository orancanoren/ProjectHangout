import React from 'react';
import PropTypes from 'prop-types';

class FlashMessage extends React.Component {
    render() {
        return (
        <script>
            Materialize.toast({this.props.message}, 4000);
        </script>
        );
    }
}

FlashMessage.PropTypes = {
    message: PropTypes.string
};

export default FlashMessage;