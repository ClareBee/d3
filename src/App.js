import React, { Component } from 'react';
import './App.css';
import * as d3 from 'd3';
import chroma from 'chroma-js';
import _ from 'lodash';
import expensesData from './data/expenses';

let colorScale = chroma.scale(['#53cf8d', '#f7d283' ,'#c85151']);
let amountScale = d3.scaleLinear();
let width = 900;
let height = 900;
let radius = 20;
let simulation = d3.forceSimulation()
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('charge', d3.forceManyBody(-10))
  .force('collide', d3.forceCollide(radius))
  .stop();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expenses:[]
    }
    this.forceTick = this.forceTick.bind(this);
    this.renderCircles = this.renderCircles.bind(this);
    simulation.on('tick', this.forceTick);
  }

  componentWillMount() {
    let expenses = _.chain(expensesData)
        .filter(d => d.amount > 0)
        .map(d => {
          return {
            amount: -d.amount,
            description: d.name,
            date: d.date,
          }
        }).value();
    this.setState({expenses});
    // process data
    let amountExtent = d3.extent(expenses, d => d.amount);
    colorScale.domain(amountExtent);
  }

  componentDidMount() {
    this.container = d3.select(this.refs.container);
    this.renderCircles();
    simulation.nodes(this.state.expenses).alpha(0.9).restart();
  }

  componentDidUpdate(){
    this.renderCircles();
  }

  renderCircles(){
    // draw expenses circles
    this.circles = this.container.selectAll('circle')
      .data(this.state.expenses, d => d.name);
    // exit
    this.circles.exit().remove();
    // enter/update
    this.circles = this.circles.enter().append('circle')
      .merge(this.circles)
      .attr('r', radius)
      .attr('fill', d => colorScale(amountScale(d.amount)));
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
