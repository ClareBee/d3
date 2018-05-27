import React from 'react';
import * as d3 from 'd3';
import chroma from 'chroma-js';
import _ from 'lodash';

const width = 700;
const height = 600;
const margin = { top: 30, right: 30, bottom: 30, left: 50};
const radius = 7;

const daysOfWeek = [[0, 'S'], [1, 'M'], [2, 'T'], [3, 'W'], [4, 'Th'], [5, 'F'], [6, 'Sa']];
let xScale = d3.scaleBand().domain(_.map(daysOfWeek, 0));
let yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);
let colorScale = chroma.scale(['#53cf8d', '#f7d283' ,'#c85151']);
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
    this.state = {
      selectedWeek: null,
      weeks: null,
      days: null,
    }
    this.forceTick = this.forceTick.bind(this);
    this.renderDayCircles = this.renderDayCircles.bind(this);
    this.calculateData = this.calculateData.bind(this);
    this.renderWeeks = this.renderWeeks.bind(this);
  }

  componentDidUpdate() {
    this.calculateData();
  }

  componentDidMount() {
    this.container = d3.select(this.refs.container);
    this.renderWeeks();
    this.renderDayCircles();
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

    let selectedWeek = weeksExtent[1];
    let perAngle = Math.PI / 6;
    let selectedWeekRadius = (width - margin.right - margin.left) / 2;

  // create rectangle for weeks
    let weeks = d3.timeWeek.range(weeksExtent[0], d3.timeWeek.offset(weeksExtent[1], 1));
    this.weeks = _.map(weeks, week => {
      return {
        week,
        x: margin.left,
        y: yScale(week) + height,
      }
    });
  // create circles for days/semi circle
    this.days = _.map(daysOfWeek, date => {
      let [dayOfWeek, name] = date;
      let angle = Math.PI - perAngle * dayOfWeek;
      let x = selectedWeekRadius * Math.cos(angle) + width;
      let y = selectedWeekRadius * Math.sin(angle) + margin.top;
      return {
        name,
        x, y,
      }
    })
    let expenses = _.chain(this.props.expenses)
      .groupBy(d => d3.timeWeek.floor(d.date))
      .map((expenses, week) => {
        week = new Date(week);
        return _.map(expenses, exp => {
          let dayOfWeek = exp.date.getDay();
          let focusX = xScale(exp.date.getDay());
          let focusY = yScale(week) + height;
          if (week.getTime() === selectedWeek.getTime()) {
            let perAngle = Math.PI / 6;
            let angle = Math.PI - perAngle * dayOfWeek;
            focusX = selectedWeekRadius * Math.cos(angle) + width / 2;
            focusY = selectedWeekRadius * Math.sin(angle) + margin.top;
          }
          return Object.assign(exp, {
            focusX,
            focusY
          });
        });
      }).flatten().value();
    let amountExtent = d3.extent(expenses, d => d.amount);
    amountScale.domain(amountExtent);
  }

  renderCircles(){
    // draw expenses circles
    this.circles = this.container.selectAll('.expense')
      .data(this.props.expenses, d => d.name);
    // exit
    this.circles.exit().remove();
    // enter/update
    this.circles = this.circles.enter().append('circle')
      .classed('expense', true)
      .attr('r', radius)
      .attr('fill-opacity', 0.25)
      .attr('stroke-width', 3)
      .merge(this.circles)
      .attr('fill', d => colorScale(amountScale(Math.abs(d.amount))))
      .attr('stroke', d => colorScale(amountScale(Math.abs(d.amount))));
  }

  renderDayCircles() {
    let perAngle = Math.PI / 6;
    let selectedWeekRadius = (width - margin.right - margin.left) / 2;

  // create circles for days/semi circle
    this.days = _.map(daysOfWeek, date => {
      let [dayOfWeek, name] = date;
      let angle = Math.PI - perAngle * dayOfWeek;
      let x = selectedWeekRadius * Math.cos(angle) + width /2;
      let y = selectedWeekRadius * Math.sin(angle) + margin.top;
      return {
        name,
        x, y,
      }
    });
    let days = this.container.selectAll('.day')
      .data(this.days, d => d.name)
      .enter().append('g')
      .classed('day', true)
      .attr('transform', d => 'translate(' + [d.x, d.y] + ')');

    const dayRadius = 40;
    const fontSize = 12;
    days.append('circle')
      .attr('r', dayRadius)
      .attr('fill', '#fcfcfc')

    days.append('text')
      .attr('y', dayRadius + fontSize)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#bbb')
      .style('font-weight', 'bold')
      .text(d => d.name)
  }

  renderWeeks() {
    let weeksExtent = d3.extent(this.props.expenses,
      d => d3.timeWeek.floor(d.date));
    yScale.domain(weeksExtent);

    let selectedWeek = weeksExtent[1];
    let perAngle = Math.PI / 6;
    let selectedWeekRadius = (width - margin.right - margin.left) / 2;

  // create rectangle for weeks
    let calcWeeks = d3.timeWeek.range(weeksExtent[0], d3.timeWeek.offset(weeksExtent[1], 1));
    let weekRes = _.map(calcWeeks, week => {
      return {
        week,
        x: margin.left,
        y: yScale(week) + height,
      }
    });
    let weeks = this.container.selectAll('.week')
      .data(weekRes, d => d.name)
      .enter().append('g')
      .classed('week', true)
      .attr('transform', d => 'translate(' + [d.x, d.y] + ')')

    const rectHeight = 10;
    weeks.append('rect')
      .attr('width', width - margin.left - margin.right)
      .attr('height', rectHeight)
      .attr('y', - rectHeight / 2)
      .attr('fill', '#ccc')
      .attr('opacity', 0.25)

    const weekFormat = d3.timeFormat('%d/%m')
    weeks.append('text')
      .attr('text-anchor', 'end')
      .attr('dy', '.35em')
      .text(d => weekFormat(d.week))
  }

  forceTick(){
    this.circles.attr('cx', d => d.x)
      .attr('cy', d => d.y)
  }

  render() {
    return (
      <svg width={width} height={2 * height} ref="container">
      </svg>
    );
  }
}

export default Expenses;
