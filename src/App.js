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
let simulation = d3.forceSimulation()
  .force('center', d3.forceCenter(width / 2, height / 2))
  // .force('charge', d3.forceManyBody())
  .force('collide', d3.forceCollide())
  .stop();

class App extends Component {
  constructor(props) {
    super(props);
    this.forceTick = this.forceTick.bind(this);
    this.renderCircles = this.renderCircles.bind(this);
  }

  componentWillMount() {
    simulation.on('tick', this.forceTick);
  }

  componentDidMount() {
    this.container = d3.select(this.refs.container);
    this.renderCircles();
    simulation.nodes(expenses).alpha(0.9).restart();
  }

  componentDidUpdate(){
    this.renderCircles();
  }

  renderCircles(){
    // draw expenses circles
    this.circles = this.container.selectAll('circle')
      .data(expenses, d => d.name);
    // exit
    this.circles.exit().remove();
    // enter/update
    this.circles = this.circles.enter().append('circle')
      .merge(this.circles)
      .attr('r', radius)
      .attr('opacity', 0.5);
  }
  forceTick(){
    this.circles.attr('cx', d => d.x)
      .attr('cy', d => d.y);
  }
  render() {
    return (
      <svg width={width} height={height} ref="container">
      </svg>
    );
  }
}

export default App;
