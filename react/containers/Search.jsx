import React from 'react';
import axios from 'axios';
import { Preloader, Card } from 'react-materialize';
import ViewCard from '../components/ViewCard.jsx';
import update from 'immutability-helper';
import PropTypes from 'prop-types';

class Search extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            search_results: null,
            redirect_target: null
        }

        this.fetchSearchResults = this.fetchSearchResults.bind(this);
        this.updateProfileData = this.updateProfileData.bind(this);
    }

    fetchSearchResults(query) {
        axios.post('/api/search', {
            search_query: query
        })
        .then((response) => {
            this.setState({
                search_results: response.data
            })
        })
        .catch((err) => {
            console.error(err);
        });
    }

    updateProfileData(email) {
        axios.get('/view/' + email)
            .then((response) => {
                var target_index = null;
                for (var i = 0; i < this.state.search_results.length && target_index == null; i++) {
                    if (this.state.search_results[i].email == email)
                        target_index = i;
                }
                if (target_index == null) {
                    console.error('impossible happened!');
                }
                this.setState({
                    search_results: update(this.state.search_results, )
                })
            })
            .catch((err) => {
                console.error(err);
            })
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

    render() {
        var render_element;
        if (this.state.search_results == null) { // FETCHING RESULTS - CONTENT PRELOADER ACTIVE
            render_element = 
            <div className='center' >
                <Preloader size='medium' flashing />
                <p>Fetching Search Results</p>
            </div>;
        }
        else if (this.state.search_results.length == 0) { // NO RESULTS!
            render_element = <p className='center'>No results!</p>
        }
        else { // RESULTS FETCHED!
            var view_cards = [];
            for (var i = 0; i < this.state.search_results.length; i++) {
                view_cards.push(<ViewCard key={i + 1} 
                    targetEmail={this.state.search_results[i].email} 
                    handleToast={this.props.handleToast} />);
            }
            render_element = view_cards;
        }

        return (
            <div style={{ marginTop: '50px' }}>
                <h5 className='center'>Search results for "{this.props.query}"</h5>
                {render_element}
            </div>
        );
    }
}

Search.PropTypes = {
    handleToast: PropTypes.func.isRequired
}

export default Search;