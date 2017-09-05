import React from 'react';
import axios from 'axios';
import { Preloader, Card } from 'react-materialize';
import ViewCard from '../components/ViewCard.jsx';

class Search extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            search_results: null
        }

        this.fetchSearchResults = this.fetchSearchResults.bind(this);
    }

    fetchSearchResults() {
        axios.post('/api/search', {
            search_query: this.props.query
        })
        .then((response) => {
            console.log('got response\n', response);
            this.setState({
                search_results: response.data
            })
        })
        .catch((err) => {
            console.error(err);
        });
    }

    componentDidMount() {
        this.fetchSearchResults();
    }

    render() {
        var render_element;
        if (this.state.search_results == null) {
            render_element = 
            <div className='center' >
                <Preloader size='medium' flashing />
                <p>Fetching Search Results</p>
            </div>;
        }
        else if (this.state.search_results.length == 0) {
            render_element = <p>No results!</p>
        }
        else {
            var view_cards = [];
            for (var i = 0; i < this.state.search_results.length; i++) {
                view_cards.push(<ViewCard key={i + 1} data={this.state.search_results[i]} />);
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

export default Search;