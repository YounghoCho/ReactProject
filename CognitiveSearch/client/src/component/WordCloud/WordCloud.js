import React, { Component } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";
import cloud from "d3-cloud";

import "./WordCloud.css";

// const WORD_COLOR_SETS = {
//   red: [
//     /* IBM Design color: Red */
//     "#fb4b53",
//     "#da1e28",
//     "#a51920",
//     "#750e13",
//     "#570408"
//   ],
//   blue: [
//     /* IBM Design color: Blue */
//     "#408bfc",
//     "#061f80",
//     "#0530ad",
//     "#054ada",
//     "#0062ff"
//   ],
//   green: [
//     /* IBM Design color: Green */
//     "#24a148",
//     "#198038",
//     "#10642a",
//     "#054719",
//     "#01330f"
//   ]
// };
const WORD_COLOR_SETS = {
  blue: [
    /* IBM Design color: 보라 */
    // "rgb(222, 212, 22)"

    "rgb(161, 224, 135)",
    "rgb(151, 219, 123)",
    "rgb(131, 199, 103)"  

  ],
  red: [
    /* IBM Design color: 주황 */
    // "rgb(143, 30, 49)"
    "rgb(285, 206, 121)",
    "rgb(265,188,101)",
    "rgb(245, 168, 81)"
      

  ],
  green: [
    /* IBM Design color: 초록 */
    // "rgb(101, 145, 31)"
    "rgb(190, 122, 211)",
    "rgb(170, 102, 191)",
    "rgb(150, 82, 171)"
  
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
  //아래 주기가 없으면 워드클라우드가 아예 안그려짐
  //data만 가지고 비교하면 첫번째 데이터만 기준으로 비교하고, 변화가 없으면 뒤의 data2 data3의 변화와 관계없이 그리지 않음
  componentDidUpdate(prevProps) {
    const prevDataLength = prevProps.data.length;
    const prevDataLength2 = prevProps.data2.length;
    const prevDataLength3 = prevProps.data3.length;

    const newDataLength = this.props.data.length;
    const newDataLength2 = this.props.data2.length;
    const newDataLength3 = this.props.data3.length;
    // console.log("pre is "+ JSON.stringify(prevProps))
    // console.log("now Object is " + JSON.stringify(this.props) + '\n')
    if (
      prevDataLength !== newDataLength ||
      this.isDataChanged(prevProps.data, this.props.data) ||
      prevDataLength2 !== newDataLength2 ||
      this.isDataChanged(prevProps.data2, this.props.data2) ||
      prevDataLength3 !== newDataLength3 ||
      this.isDataChanged(prevProps.data3, this.props.data3) 
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
        .range(["bold"]);

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

    let sum = {};
    let result = [];
    for(let i=0; i<color.length; i++){
      sum = Object.assign(words[i], color[i]);
      result.push(sum);
    }
    result.sort((a, b) => b.count - a.count);



    let layout = cloud()
      .size([viewBoxWidth, viewBoxHeight])
      .padding(3) //글자간 간격
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
    
    //.data의 words의 word.index가 들어오는건가?
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
      .attr("cursor", "pointer")
      .attr("font-size", datum => datum.fontSize)
      .attr("font-weight", datum => datum.fontWeight)
      .style("fill", datum => datum.color)
      .on("click", d => {
        this.props.handleSendQuery(d.text);
      })
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
