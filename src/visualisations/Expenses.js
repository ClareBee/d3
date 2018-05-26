import React from 'react';
import * as d3 from 'd3';
import chroma from 'chroma-js';
import _ from 'lodash';

const width = 600;
const height = 600;
const margin = { top: 20, right: 20, bottom: 20, left: 20};
const radius = 7;

let xScale = d3.scaleBand().domain([0, 1, 2, 3, 4, 5, 6]);
let yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);
let colorScale = chroma.scale(['#53cf8d', '#f7d283' ,'#c85151']);
console.log(colorScale);
let amountScale = d3.scaleLog();

let simulation = d3.forceSimulation()
  // .force('charge', d3.forceManyBody(-10))
  .force('collide', d3.forceCollide(radius))
  .force('x', d3.forceX(d => d.focusX))
  .force('y', d3.forceY(d => d.focusY))
  .stop();

class Expenses extends React.Component {
  constructor(props) {
    super(props);
    this.forceTick = this.forceTick.bind(this);
  }

  componentDidUpdate() {
    this.calculateData();
  }

  componentDidMount() {
    this.container = d3.select(this.refs.container);
    this.renderCircles();
    this.calculateData();
    simulation.nodes(this.props.expenses).alpha(0.9).restart();
  }

  componentWillMount(){
    xScale.range([margin.left, width - margin.right])
    simulation.on('tick', this.forceTick);
  }

  calculateData() {
    let weeksExtent = d3.extent(this.props.expenses,
      d => d3.timeWeek.floor(d.date));
    yScale.domain(weeksExtent);
    let expenses = _.chain(this.props.expenses)
      .groupBy(d => d3.timeWeek.floor(d.date))
      .map((expenses, week) => {
        week = new Date(week);
        return _.map(expenses, exp => {
          return Object.assign(exp, {
            focusX: xScale(exp.date.getDay()),
            focusY: yScale(week)
          });
        });
      }).flatten().value();
    console.log(expenses)
    let amountExtent = d3.extent(expenses, d => d.amount);
    amountScale.domain(amountExtent);
  }

  renderCircles(){
    console.log(colorScale(10))
    // draw expenses circles
    this.circles = this.container.selectAll('circle')
      .data(this.props.expenses, d => d.name);
    // exit
    this.circles.exit().remove();
    // enter/update
    this.circles = this.circles.enter().append('circle')
      .merge(this.circles)
      .attr('r', radius)
      .attr('fill', d => colorScale(amountScale(Math.abs(d.amount))))
      .attr('fill-opacity', 0.25)
      .attr('stroke-width', 3)
      .attr('stroke', d => colorScale(amountScale(Math.abs(d.amount))));
    console.log(this.circles)
  }

  forceTick(){
    this.circles.attr('cx', d => d.x)
      .attr('cy', d => d.y);
  }

  render() {
    console.log('props', this.props)
    return (
      <svg width={width} height={height} ref="container">
      </svg>
    );
  }
}

export default Expenses;
