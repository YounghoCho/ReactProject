import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { Icon } from "antd";

import "./InfoModal.css";

const InfoModalContainer = ({
  title = "",
  maskTop = 0,
  maskLeft = 0,
  maskHeight = 0,
  maskWidth = 0,
  visible = false,
  children,
  onClose = () => {}
}) => (
  <div
    className="InfoModal"
    style={{
      height: maskHeight,
      width: maskWidth,
      top: maskTop,
      left: maskLeft,
      display: visible ? "block" : "none"
    }}
  >
    <div className="InfoModal-mask" />
    <div className="InfoModal-wrapper">
      <div
        className="InfoModal-container"
        style={{
          maxHeight: `${maskHeight - 32}px`
        }}
      >
        <div className="InfoModal-container-header">
          <div>{title}</div>
          <div className="InfoModal-button-close">
            <Icon type="close" style={{ fontSize: 20 }} onClick={onClose} />
          </div>
        </div>
        <div className="InfoModal-container-body">{children}</div>
      </div>
    </div>
  </div>
);

class InfoModal extends Component {
  /* React lifecycle methods */
  constructor(props) {
    super(props);
    this.state = {
      maskTop: 0,
      maskLeft: 0,
      maskHeight: 0,
      maskWidth: 0,
      attachedContainer: document.body
    };
  }

  componentDidMount() {
    this.setModalSize(this.props.getTargetContainer());
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.getTargetContainer !== this.props.getTargetContainer) {
      this.setModalSize(this.props.getTargetContainer());
    }
  }

  render() {
    const { title, visible, onClose } = this.props;
    const { maskHeight, maskWidth, maskTop, maskLeft } = this.state;
    return ReactDOM.createPortal(
      <InfoModalContainer
        title={title}
        maskHeight={maskHeight}
        maskWidth={maskWidth}
        maskTop={maskTop}
        maskLeft={maskLeft}
        onClose={onClose}
        visible={visible}
      >
        {this.props.children}
      </InfoModalContainer>,
      this.state.attachedContainer
    );
  }
  /* end of lifecycle methods */

  /* other methods */
  setModalSize = targetContainer => {
    if (targetContainer) {
      this.setState((prevState, props) => {
        const attachedContainer = targetContainer.parentNode;
        attachedContainer.setAttribute("style", "overflow: hidden");
        return {
          maskTop: targetContainer.offsetTop,
          maskLeft: targetContainer.offsetLeft,
          maskHeight: targetContainer.offsetHeight,
          maskWidth: targetContainer.offsetWidth,
          attachedContainer: attachedContainer || document.body
        };
      });
    }
  };
  /* end of other methods */
}

InfoModalContainer.propTypes = {
  title: PropTypes.any,
  visible: PropTypes.bool,
  onClose: PropTypes.func,
  getTargetContainer: PropTypes.func
};

export default InfoModal;
