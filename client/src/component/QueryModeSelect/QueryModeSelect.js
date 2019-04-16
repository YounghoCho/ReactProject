import React from "react";
import PropTypes from "prop-types";
import { Select } from "antd";
import { i18n } from "../../lib/constant";

import "./QueryModeSelect.css";

const Option = Select.Option;

const QUERY_MODE_BASIC_SEARCH = 0;
const QUERY_MODE_SIMILAR_DOCUMENT_SEARCH = 1;
const QUERY_MODE_PHRASAL_SEARCH = 2;
const QUERY_MODE = [
  QUERY_MODE_BASIC_SEARCH,
  QUERY_MODE_SIMILAR_DOCUMENT_SEARCH,
  QUERY_MODE_PHRASAL_SEARCH
];

export {
  QUERY_MODE_BASIC_SEARCH,
  QUERY_MODE_SIMILAR_DOCUMENT_SEARCH,
  QUERY_MODE_PHRASAL_SEARCH,
  QUERY_MODE
};

const QueryModeSelect = ({ size, value, onChange, disabled, style }) => (
  <Select
    className="QueryModeSelect"
    size={size}
    value={value}
    onChange={onChange}
    disabled={disabled}
    style={style}
  >
    <Option value={QUERY_MODE_BASIC_SEARCH}>{i18n.BASIC_SEARCH}</Option>
    <Option value={QUERY_MODE_SIMILAR_DOCUMENT_SEARCH}>
      {i18n.SIMILAR_DOCUMENT_SEARCH}
    </Option>
    <Option value={QUERY_MODE_PHRASAL_SEARCH}>{i18n.PHRASAL_SEARCH}</Option>
  </Select>
);

QueryModeSelect.propTypes = {
  size: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func,
  disabled: PropTypes.bool
};

QueryModeSelect.defaultProps = {
  size: "default",
  value: QUERY_MODE_BASIC_SEARCH,
  onChange: () => {},
  disabled: false
};

export default QueryModeSelect;
