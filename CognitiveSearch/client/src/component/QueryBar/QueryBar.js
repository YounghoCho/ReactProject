import React, { Component } from "react";
import PropTypes from "prop-types";
import { Input, Button } from "antd";
import QueryModeSelect from "../QueryModeSelect";

import "./QueryBar.css";
const { TextArea } = Input;

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
      queryMode,
      onChangeQueryMode,
      onChangeInput,
      inputValue,
      onClear,
      onSearch,
      placeholder,
      disabled,
      style
    } = this.props;
    return (
      <div className="QueryBar" sytle={style}>
        <QueryModeSelect
          value={queryMode}
          onChange={onChangeQueryMode}
          disabled={disabled}
          style={{ margin: "1px 0px", minWidth: 155 }}
        />
        <div
          className="QueryBar-container"
          style={{
            height: this.state.isFocused ? "auto" : "34px",
            overflow: this.state.isFocused ? "auto" : "hidden"
          }}
        >
          <TextArea
            disabled={disabled}
            placeholder={placeholder}
            autosize
            onChange={onChangeInput}
            style={{
              marginRight: "8px",
              resize: "none",
              border: "none",
              boxShadow: "none"
            }}
            value={inputValue}
            onBlur={this.handleInputBlur}
            onFocus={this.handleInputFocus}
            onKeyPress={this.handleKeyPress}
          />
          <Button icon="close" onClick={onClear} style={{ border: "none" }} />
          <Button
            icon="search"
            onClick={onSearch}
            style={{
              border: "none"
            }}
          />
        </div>
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
