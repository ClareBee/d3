import React, { Component } from 'react';
import './App.css';
import * as d3 from 'd3';

var expenses = [
    {
      name: 'Coffee',
      amount: 4,
      date: new Date()
    },
    {
      name: 'Safeway',
      amount: 20,
      date: new Date()
    },
    {
      name: 'Amazon',
      amount: 15,
      date: new Date()
    },

];
let width = 900;
let height = 900;
let radius = 10;
let simulation = d3.forceSimulation();

class App extends Component {
  componentWillMount() {

  }

  componentDidMount() {
    this.container = d3.select(this.refs.container);
    // draw expenses circles
    let circles = this.container.selectAll('circle')
      .data(expenses, d => d.name);
    // exit
    circles.exit().remove();
    // enter/update
    circles = circles.enter().append('circle')
      .merge(circles)
      .attr('r', radius);
  }

  render() {
    return (
      <svg width={width} height={height} ref="container">
      </svg>
    );
  }
}

export default App;
