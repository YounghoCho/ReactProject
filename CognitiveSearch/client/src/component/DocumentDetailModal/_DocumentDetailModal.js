import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Modal, Table, Tabs } from "antd";
import WordCloud from "../WordCloud";
import { i18n } from "../../lib/constant";
import "./DocumentDetailModal.css";

const TabPane = Tabs.TabPane;

class DocumentDetailModal extends Component {
  /* React lifecycle methods */
  constructor(props) {
    super(props);
    this.state = {
      currentFieldPage: 1,
      currentWordPage: 1
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.props.visible && this.state.currentFieldPage !== 1) {
      this.setState({
        currentFieldPage: 1,
        currentWordPage: 1
      });
    }

    if (!prevProps.visible && this.modalBodyContent) {
      this.modalBodyContent.scrollTop = 0;
    }
  }

  render() {
    const {
      doc,
      fieldPageSize,
      wordPageSize,
      visible,
      onOk,
      onCancel,
      footer
    } = this.props;
    const { currentFieldPage, currentWordPage } = this.state;
    return (
      <Modal
        title={doc.Title || "No title"}
        visible={visible}
        onCancel={onCancel}
        onOk={onOk}
        width={"90%"}
        footer={footer}
      >
        <div className="DocumentDetailModal-body">
          <div
            className="DocumentDetailModal-body-content"
            ref={this.setModalBodyContentRef}
          >
            {doc.___highlighting ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: `${doc.___highlighting}`
                }}
              />
            ) : (
              doc.body
            )}
          </div>
          <div className="DocumentDetailModal-body-field">
            <Tabs defaultActiveKey="fields">
              <TabPane tab={i18n.FIELDS} key="fields">
                {this.renderFieldTable(doc, fieldPageSize, currentFieldPage)}
              </TabPane>
              <TabPane tab={i18n.WORD_CLOUD} key="wordcloud">
                {this.renderWordTable(
                  doc.___annotations,
                  wordPageSize,
                  currentWordPage
                )}
              </TabPane>
            </Tabs>
          </div>
        </div>
      </Modal>
    );
  }
  /* end of lifecycle methods */

  /* other methods */
  setModalBodyContentRef = element => {
    this.modalBodyContent = element;
  };

  renderFieldTable = (doc, fieldPageSize, currentFieldPage) => {
    let dataSource = [];
    let i = 0;
    for (let key in doc) {
      if (
        key !== "body" &&
        key !== "___highlighting" &&
        key !== "___annotations"
      ) {
        dataSource.push({
          key: i++,
          fieldName: key,
          fieldValue: doc[key]
        });
      }
    }
    const columns = [
      {
        title: i18n.FIELD_NAME,
        dataIndex: "fieldName",
        key: "fieldName",
        sorter: (a, b) => {
          if (a.fieldName < b.fieldName) return -1;
          if (a.fieldName > b.fieldName) return 1;
          return 0;
        },
        defaultSortOrder: "ascend"
      },
      {
        title: i18n.FIELD_VALUE,
        dataIndex: "fieldValue",
        key: "fieldValue"
      }
    ];
    return (
      <Table
        columns={columns}
        dataSource={dataSource}
        size="middle"
        pagination={{
          pageSize: fieldPageSize || 5,
          hideOnSinglePage: true,
          current: currentFieldPage,
          onChange: (page, pageSize) => {
            this.setState({
              currentFieldPage: page
            });
          }
        }}
      />
    );
  };

  renderWordTable = (annotations, wordPageSize, currentWordPage) => {
    if (!annotations || annotations.length === 0) {
      return <div class="ant-list-empty-text">No data</div>;
    }

    const columns = [
      {
        title: i18n.WORD,
        dataIndex: "annotation",
        key: "annotation"
      },
      {
        title: i18n.COUNT,
        dataIndex: "count",
        key: "count"
      }
    ];
    return (
      <Fragment>
        <WordCloud
          width={"100%"}
          height={"30vh"}
          data={
            annotations.length > 50 ? annotations.slice(0, 50) : annotations
          }
        />
        <Table
          rowKey="annotation"
          columns={columns}
          dataSource={annotations}
          size="middle"
          pagination={{
            pageSize: wordPageSize || 10,
            hideOnSinglePage: true,
            current: currentWordPage,
            onChange: (page, pageSize) => {
              this.setState({
                currentWordPage: page
              });
            }
          }}
        />
      </Fragment>
    );
  };
  /* end of other methods */
}

DocumentDetailModal.propTypes = {
  doc: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  onOk: PropTypes.func,
  onCacnel: PropTypes.func,
  fieldPageSize: PropTypes.number,
  footer: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
};

DocumentDetailModal.defaultProps = {
  doc: { title: "", body: "" },
  visible: false,
  fieldPageSize: 10,
  wordPageSize: 10,
  footer: null
};

export default DocumentDetailModal;
