import React, { Component } from 'react';
import './App.css';
import _ from 'lodash';
import expensesData from './data/expenses';
import Expenses from './visualisations/Expenses';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expenses: {}
    }
  }

  componentWillMount() {

    let expenses = _.chain(expensesData)
      .filter(d => d.amount > 0)
      .map(d => {
        return {
          amount: -d.amount,
          description: d.name,
          date: new Date(d.date),
        }
      }).value();
    this.setState({
      expenses,
    });
  }

  render() {
    return (
      <Expenses expenses={this.state.expenses}/>
    );
  }
}

export default App;
