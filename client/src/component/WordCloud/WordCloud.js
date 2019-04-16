import React, { Component } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";
import cloud from "d3-cloud";

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
  setSvgRef = element => {
    this.svg = d3.select(element);
    this.svgElement = element;
  };

  componentDidMount() {
    this.renderWordCloud(
      this.props.data,
      this.svgElement.clientWidth,
      this.svgElement.clientHeight
    );
  }

  componentDidUpdate(prevProps) {
    const prevDataLength = prevProps.data.length;
    const newDataLength = this.props.data.length;
    if (
      prevDataLength !== newDataLength ||
      this.isDataChanged(prevProps.data, this.props.data)
    ) {
      this.renderWordCloud(
        this.props.data,
        this.svgElement.clientWidth,
        this.svgElement.clientHeight
      );
    }
  }

  componentWillUnmount() {
    this.svg = null;
    this.svgElement = null;
  }

  render() {
    const { width, height } = this.props;
    return (
      <svg width={width} height={height} ref={this.setSvgRef}>
        <g />
      </svg>
    );
  }
  /* end of lifecycle methods */

  isDataChanged(prevData, newData) {
    for (let i = 0, count = prevData.length; i < count; i++) {
      if (prevData[i].annotation !== newData[i].annotation) return true;
    }
    return false;
  }

  createWords = data => {
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

    let words = data.map((datum, index) => {
      const fontSize = fontSizeScale(datum.count);
      return {
        id: index,
        fontSize,
        fontWeight: fontWeightScale(datum.count),
        text: datum.annotation,
        count: datum.count,
        color: colorScale(datum.count)
      };
    });
    words.sort((a, b) => b.count - a.count);

    return words;
  };

  renderWordCloud = (data, viewBoxWidth, viewBoxHeight) => {
    this.svg
      .select("g")
      .selectAll("*")
      .remove();

    let words = this.createWords(data);

    let layout = cloud()
      .size([viewBoxWidth, viewBoxHeight])
      .words(words)
      .text(datum => datum.text)
      .rotate(() => 0)
      .fontSize(datum => datum.fontSize)
      .on("end", this.draw.bind(this, viewBoxWidth, viewBoxHeight));

    layout.start();
    layout.stop();
  };

  draw = (viewBoxWidth, viewBoxHeight, words) => {
    let wordCloud = this.svg
      .attr("viewBox", "0 0 " + viewBoxWidth + " " + viewBoxHeight)
      .select("g")
      .attr(
        "transform",
        "translate(" + viewBoxWidth / 2 + "," + viewBoxHeight / 2 + ")"
      )
      .selectAll(".wordCloud")
      .data(words, word => word.index);
    wordCloud.exit().remove();

    wordCloud = wordCloud
      .enter()
      .append("text")
      .classed("wordCloud", true)
      .attr(
        "transform",
        datum =>
          "translate(" + [datum.x, datum.y] + ")rotate(" + datum.rotate + ")"
      )
      .attr("text-anchor", "middle")
      .attr("font-size", datum => datum.fontSize)
      .attr("font-weight", datum => datum.fontWeight)
      .style("fill", datum => datum.color)
      .text(datum => datum.text);
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
