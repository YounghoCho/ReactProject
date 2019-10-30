// module imports
import React from "react";
import PropTypes from "prop-types";
import { Select, Button } from "antd";

// static file imports
import "./CollectionSelect.css";

const Option = Select.Option;
const CollectionSelect = ({
  collections,
  currentCollectionId,
  onChangeCollection,
  onClickRefresh,
  isLoadingCollection
}) => (
  <div className="CollectionSelect" style={{color:'white'}}>
    {`검색대상 콜렉션 : `}
    <Select
      className="CollectionSelect-select"
      value={currentCollectionId}
      onChange={onChangeCollection}
      disabled={isLoadingCollection}
    >
      {collections.map(collection => (
        <Option key={collection.id} value={collection.id}>
          {collection.name}
        </Option>
      ))}
    </Select>
    <Button
      type="primary"
      loading={isLoadingCollection}
      icon={"reload"}
      onClick={onClickRefresh}
    />
  </div>
);

CollectionSelect.defaultProps = {
  collections: [],
  currentCollectionId: "",
  onChange: () => {},
  onClickRefresh: () => {}
};

CollectionSelect.propTypes = {
  collections: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      id: PropTypes.string
    })
  ),
  currentCollectionId: PropTypes.string,
  onChangeCollection: PropTypes.func,
  onClickRefresh: PropTypes.func,
  isLoadingCollection: PropTypes.bool
};

export default CollectionSelect;
