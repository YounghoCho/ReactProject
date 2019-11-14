import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, AutoComplete  } from "antd";
// import QueryModeSelect from "../QueryModeSelect";

import "./QueryBar.css";
const dataSource = [
  '이미지 인식',
  '영상에서 물체를 분류',
  '영상 속의 특정 객체를 찾다',
  '영상 속의 특정 객체를 찾는 것을 인공지능을 활용해서 자동차 산업에 적용한',
  '공공부문에 인공지능을 도입한 것을 찾아주세요'
];

class QueryBar extends Component {
  /* React lifecycle methods */
  constructor(props) {
    super(props);
    this.state = {
      isFocused: false
    };
  }

  render() {
    const {
      // queryMode,
      // onChangeQueryMode,
      onChangeInput,
      onSearch,
      defaultQueryValue
    } = this.props;
    return (
      <div className="QueryBar">
        {/*<QueryModeSelect*/}
          {/*value={queryMode}*/}
          {/*onChange={onChangeQueryMode}*/}
          {/*disabled={disabled}*/}
          {/*style={{ margin: "1px 0px", minWidth: 155 }}*/}
        {/*/>*/}
        <form 
            onSubmit={(e) => { 
              e.preventDefault();
              this.props.onSearch();  //앤터넣는 방법..고생
            }}
            style={{
              width: "100%",
              inlineHeight: "0px"
            }}
            >
        <div
          className="QueryBar-container"
          style={{
            height: this.state.isFocused ? "auto" : "34px",
            overflow: this.state.isFocused ? "auto" : "hidden"
          }}
        >
            {<AutoComplete
            // onBlur={this.handleInputBlur}
            // onFocus={this.handleInputFocus}
            style={{
              width: "100%",
              border: "none",
              boxShadow: "none"
            }}
            dataSource={dataSource}
            placeholder="ex) 이미지 인식"
            filterOption={(inputValue, option) =>
              option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
            }
            onChange={onChangeInput}
            allowClear={true}
            value={defaultQueryValue}
            defaultActiveFirstOption={true}
            autoFocus={true}
            //  onKeyPress={this.handleKeyPress}
            //  onPressEnter={this.handleKeyPress}
            />
            }

          {/* <AutoComplete
            disabled={disabled}
            placeholder="ex) 이미지 인식"
            dataSource={dataSource}
            autosize
            // onChange={onChangeInput}
            style={{
              width: "100%",
              marginRight: "8px",
              resize: "none",
              border: "none",
              boxShadow: "none"
            }}
            value={inputValue}
            // onBlur={this.handleInputBlur}
            // onFocus={this.handleInputFocus}
            // onKeyPress={this.handleKeyPress}
          /> */}
          {/* <Button icon="close" onClick={onClear} style={{ border: "none" }} /> */}
          <Button
            icon="search"
            onClick={onSearch}
            style={{
              border: "none"
            }}
          />
        </div>
        </form>
      </div>
    );
  }
  /* end of lifecycle methods */

  /* ui handler methods */
  handleInputBlur = () => {
    this.setState({
      isFocused: false
    });
  };

  handleInputFocus = () => {
    this.setState({
      isFocused: true
    });
  };

  handleKeyPress = event => {
    console.log('in1');
    let code = event.key
      ? event.key
      : event.keyCode
        ? event.keyCode
        : event.which;
    if (
      !(event.shiftKey || event.altKey) &&
      (code === 13 || code === "Enter")
    ) {
      event.preventDefault();
      this.props.onSearch();
      return;
    }
  };
  /* end of ui handler methods */
}

QueryBar.propTypes = {
  onChangeInput: PropTypes.func,
  inputValue: PropTypes.string,
  onClear: PropTypes.func,
  onSearch: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool
};

QueryBar.defaultProps = {
  onChangeInput: () => {},
  inputValue: "",
  onClear: () => {},
  onSearch: () => {},
  placeholder: "Please input any query",
  disabled: false
};

export default QueryBar;
