import React, { Component } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";
import cloud from "d3-cloud";

import "./WordCloud.css";

// const WORD_COLOR_SETS = {
//   blue: [
//     /* IBM Design color: Cerulean */
//     "#009bef",
//     "#047cc0",
//     "#046cc0",
//     "#175d8d"
//   ],
//   red: [
//     /* IBM Design color: Red */
//     "#ff5c49",
//     "#e62325",
//     "#d31325",
//     "#aa231f"
//   ],
//   green: [
//     /* IBM Design color: Green */
//     "#00aa5e",
//     "#00884b",
//     "#00784b",
//     "#116639"
//   ]
// };
const WORD_COLOR_SETS = {
  blue: [
    /* IBM Design color: Cerulean */
    "#009bef"
  ],
  red: [
    /* IBM Design color: Red */
    "#ff5c49"
  ],
  green: [
    /* IBM Design color: Green */
    "#00aa5e"
  ]
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
        this.props.data2,
        this.props.data3,
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
          this.props.data2,
          this.props.data3,
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

  createColor = ( data, GroupColor )=> {
    if (data.length === 0) {
      return [];
    }
    // Use the max total_amount in the data as the max in the scale's domain
    // note we have to ensure the total_amount is a number.
    let maxCount = d3.max(data, datum => datum.count);
    let minCount = d3.min(data, datum => datum.count);

    let colorScale = d3
        .scaleQuantize()
        .domain([minCount, maxCount])
        .range(WORD_COLOR_SETS[GroupColor]);

    let words = data.map((datum, index) => {
      return {
        color: colorScale(datum.count)
      };
    });
    return words;
  };

  createWords = ( data )=> {
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
        .range([22, 42]);

    let fontWeightScale = d3
        .scaleQuantize()
        .domain([minCount, maxCount])
        // .range(["lighter", "normal", "bold", "bolder"]);
        .range(["normal", "bold", "bolder"]);

    let words = data.map((datum, index) => {
      const fontSize = fontSizeScale(datum.count);
      return {
        id: index,
        fontSize,
        fontWeight: fontWeightScale(datum.count),
        text: datum.annotation,
        count: datum.count
      };
    });
    return words;
  };


  renderWordCloud = (data, data2, data3, viewBoxWidth, viewBoxHeight) => {
    this.svg
      .select("g")
      .selectAll("*")
      .remove();

    let color = this.createColor(data, "blue");
    let color2 = this.createColor(data2, "red");
    let color3 = this.createColor(data3, "green");
    color = color.concat(color2);
    color = color.concat(color3);
    // color :[{"color":"#ff5c49"},{"color":"#9f231e"},{"color":"#1c498d"},{"color":"#009bef"}]

    data = data.concat(data2);
    data = data.concat(data3);
    let words = this.createWords(data);
    // words :[{"id":0,"fontSize":32,"fontWeight":"bolder","text":"인공지능","count":60},
    //         {"id":1,"fontSize":14,"fontWeight":"lighter","text":"머신러닝","count":3},
    //         {"id":0,"fontSize":14,"fontWeight":"lighter","text":"조영호","count":20},
    //         {"id":1,"fontSize":32,"fontWeight":"bolder","text":"강효정","count":40}
    //        ]

    let sum = {};
    let result = [];
    for(let i=0; i<color.length; i++){
      sum = Object.assign(words[i], color[i]);
      result.push(sum);
    }
    result.sort((a, b) => b.count - a.count);
    // alert(JSON.stringify(result));
    // result : [{"id":0,"fontSize":32,"fontWeight":"bolder","text":"인공지능","count":60,"color":"#ff5c49"},
    //           {"id":1,"fontSize":32,"fontWeight":"bolder","text":"강효정","count":40,"color":"#009bef"},
    //           {"id":0,"fontSize":14,"fontWeight":"lighter","text":"조영호","count":20,"color":"#1c498d"},
    //           {"id":1,"fontSize":14,"fontWeight":"lighter","text":"머신러닝","count":3,"color":"#9f231e"}
    //          ]


    let layout = cloud()
      .size([viewBoxWidth, viewBoxHeight])
      .words(result)
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
