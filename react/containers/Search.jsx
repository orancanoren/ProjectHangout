import React from 'react';
import axios from 'axios';
import { Preloader, Card } from 'react-materialize';
import update from 'immutability-helper';
import PropTypes from 'prop-types';
import CardList from './CardList.jsx';

/*
state.search_results is an array
*/

class Search extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            search_results: null,
            redirect_target: null
        }

        this.fetchSearchResults = this.fetchSearchResults.bind(this);
        this.handleFollowAction = this.handleFollowAction.bind(this);
    }

    fetchSearchResults(query) {
        axios.post('/api/search', {
            search_query: query
        })
        .then((response) => {
            console.log('search_results:\n', response.data);
            this.setState({
                search_results: response.data
            })
        })
        .catch((err) => {
            console.error(err);
        });
    }

    componentDidMount() {
        this.fetchSearchResults(this.props.query);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            search_results: null
        });
        this.fetchSearchResults(nextProps.query);
    }

    handleFollowAction() {
        this.forceUpdate();
    }

    render() {
        var renderedContent;
        if (this.state.search_results == null) { // FETCHING RESULTS - CONTENT PRELOADER ACTIVE
            renderedContent = 
            <div className='center' >
                <Preloader size='medium' flashing />
                <p>Fetching Search Results</p>
            </div>;
        }
        else if (this.state.search_results.length == 0) { // NO RESULTS!
            renderedContent = <p className='center'>No results!</p>
        }
        else { // RESULTS FETCHED!
            renderedContent = <CardList 
                emails={this.state.search_results}
                handleToast={this.props.handleToast}
                updateInfo={this.handleFollowAction} />
        }

        return (
            <div style={{ marginTop: '50px' }}>
                <h5 className='center'>Search results for "{this.props.query}"</h5>
                {renderedContent}
            </div>
        );
    }
}

Search.PropTypes = {
    handleToast: PropTypes.func.isRequired
}

export default Search;