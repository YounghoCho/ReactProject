/**
 * deprecated: It had issues with words that contain alphabet
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";

import "./WordCloud.css";

const WORD_COLOR_SETS = {
  blue: [
    /* IBM Design color: Cerulean */
    "#95c4f3",
    "#56acf2",
    "#009bef",
    "#047cc0",
    "#175d8d",
    "#1c496d"
  ],
  red: [
    /* IBM Design color: Red */
    "#ffaa9d",
    "#ff806c",
    "#ff5c49",
    "#e62325",
    "#aa231f",
    "#83231e"
  ],
  green: [
    /* IBM Design color: Green */
    "#57d785",
    "#34bc6e",
    "#00aa5e",
    "#00884b",
    "#116639",
    "#12512e"
  ]
  // "#E3F2FD",
  // "#BBDEFB",
  // "#90CAF9",
  // "#64B5F6",
  // "#42A5F5",
  // "#2196F3",
  // "#1E88E5",
  // "#1976D2",
  // "#1565C0",
  // "#0D47A1"
  /* IBM Design color : Blue */
  // "#a8c0f3",
  // "#79a6f6",
  // "#5392ff",
  // "#2d74da",
  // "#1f57a4",
  // "#25467a",
  // "#1d3458",
  // "#19273c"
};

class WordCloud extends Component {
  /* React lifecycle methods */
  constructor(props) {
    super(props);
    this.state = {
      selectedData: {},
      forceStrength: 0.2,
      dx: 20,
      dy: 20
    };

    this.wordCloud = null;
  }

  setSvgRef = element => {
    this.setState(
      {
        svg: d3.select(element),
        svgElement: element
      },
      () => {
        this.center = {
          x: this.state.svgElement.clientWidth / 2,
          y: this.state.svgElement.clientHeight / 2
        };
        this.renderWordCloud(
          this.props.data,
          this.state.svgElement.clientWidth,
          this.state.svgElement.clientHeight
        );
      }
    );
  };

  componentDidUpdate(prevProps) {
    const prevDataLength = prevProps.data.length;
    const newDataLength = this.props.data.length;
    if (
      prevDataLength !== newDataLength ||
      this.isDataChanged(prevProps.data, this.props.data)
    ) {
      this.center = {
        x: this.state.svgElement.clientWidth / 2,
        y: this.state.svgElement.clientHeight / 2
      };
      this.renderWordCloud(
        this.props.data,
        this.state.svgElement.clientWidth,
        this.state.svgElement.clientHeight
      );
    }
  }

  componentWillUnmount() {
    this.wordCloud = null;
    this.forceSimulation = null;
  }

  render() {
    const { width, height } = this.props;
    return <svg width={width} height={height} ref={this.setSvgRef} />;
  }
  /* end of lifecycle methods */

  isDataChanged(prevData, newData) {
    for (let i = 0, count = prevData.length; i < count; i++) {
      if (prevData[i] !== newData[i]) return true;
    }
    return false;
  }

  /* d3 rendering methods */
  charge = d => -Math.pow(d.radius, 2);

  ticked = () => {
    if (this.wordCloud) {
      this.wordCloud
        .attr("x", datum => {
          return (datum.x = Math.max(
            datum.radius,
            Math.min(this.center.x * 2 - datum.radius, datum.x)
          ));
        })
        .attr("y", datum => {
          return (datum.y = Math.max(
            datum.radius,
            Math.min(this.center.y * 2 - datum.radius, datum.y)
          ));
        });
    }
  };

  createNodes = (data, viewBoxWidth, viewBoxHeight) => {
    if (data.length === 0) {
      return [];
    }
    // Use the max total_amount in the data as the max in the scale's domain
    // note we have to ensure the total_amount is a number.
    let maxCount = d3.max(data, datum => datum.count);
    let minCount = d3.min(data, datum => datum.count);

    let fontSizeScale = d3
      .scaleLinear()
      .domain([minCount, maxCount])
      .range([14, 32]);

    let fontWeightScale = d3
      .scaleQuantize()
      .domain([minCount, maxCount])
      .range(["lighter", "normal", "bold", "bolder"]);

    let colorScale = d3
      .scaleQuantize()
      .domain([minCount, maxCount])
      .range(WORD_COLOR_SETS[this.props.colorSet]);

    let myNodes = data.map((datum, index) => {
      const fontSize = fontSizeScale(datum.count);
      return {
        id: index,
        fontSize,
        radius: (fontSize * datum.annotation.length) / 2,
        fontWeight: fontWeightScale(datum.count),
        name: datum.annotation,
        value: datum.count,
        x: viewBoxWidth / 2,
        y: viewBoxHeight / 2,
        color: colorScale(datum.count)
      };
    });

    // sort them to prevent occlusion of smaller nodes.
    myNodes.sort((a, b) => b.value - a.value);

    return myNodes;
  };

  renderWordCloud = (data, viewBoxWidth, viewBoxHeight) => {
    let nodes = this.createNodes(data, viewBoxWidth, viewBoxHeight);

    this.wordCloud = this.state.svg
      .attr("viewBox", "0 0 " + viewBoxWidth + " " + viewBoxHeight)
      .selectAll(".wordCloud")
      .data(nodes, node => node.index);
    this.wordCloud.exit().remove();

    this.wordCloud = this.wordCloud
      .enter()
      .append("text")
      .classed("wordCloud", true)
      .attr("x", datum => datum.x)
      .attr("y", datum => datum.y)
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("font-size", datum => datum.fontSize)
      .attr("font-weight", datum => datum.fontWeight)
      .style("fill", datum => datum.color)
      .text(datum => datum.name)
      .merge(this.wordCloud);

    this.forceSimulation = d3
      .forceSimulation(nodes)
      .velocityDecay(0.6)
      .force(
        "x",
        d3
          .forceX()
          .strength(0.05)
          .x(viewBoxWidth / 2)
      )
      .force(
        "y",
        d3
          .forceY()
          .strength(0.05)
          .y(viewBoxHeight / 2)
      )
      //.force("collide", d3.forceCollide(datum => datum.radius))
      .force("charge", d3.forceManyBody().strength(this.charge))
      .on("tick", this.ticked);
  };
  /* end of d3 rendering methods */
}

WordCloud.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  data: PropTypes.array,
  colorSet: PropTypes.oneOf(["blue", "red", "green"])
};

WordCloud.defaultProps = {
  data: [],
  colorSet: "blue"
};

export default WordCloud;
