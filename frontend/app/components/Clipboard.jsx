import React from 'react';
import ReactDOM from 'react-dom';
import assign from 'react/lib/Object.assign';

function noop() {}

var Clipboard = React.createClass({

  propTypes: {
    value : React.PropTypes.string.isRequired,
    className : React.PropTypes.string,
    style : React.PropTypes.object,
    onCopy : React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      className : "clipboard",
      style : {
        "position" : "fixed",
        "left"     : 0,
        "top"      : 0,
        "width"    : 0,
        "height"   : 0,
        "padding"  : 0,
        "margin"   : 0,
        "zIndex"   : 100,
        "opacity"  : 0
      },
      onCopy : noop
    };
  },

  componentDidMount: function() {
    document.addEventListener("keydown", this.handleKeyDown, false);
    document.addEventListener("keyup", this.handleKeyUp, false);
  },

  componentWillUnmount: function() {
    document.removeEventListener("keydown", this.handleKeyDown, false);
    document.removeEventListener("keyup", this.handleKeyUp, false);
  },

  render: function() {
    return React.createElement("textarea", assign({}, this.props, { readOnly: true, onCopy : this.handleCopy }));
  },

  handleCopy : function(e) {
    this.props.onCopy(e);
  },

  handleKeyDown : function(e) {
    var metaKeyIsDown = (e.ctrlKey || e.metaKey);
    var textIsSelected = window.getSelection().toString();

    if(!metaKeyIsDown || textIsSelected) {
      return;
    }

    var element = ReactDOM.findDOMNode(this);
    element.focus();
    element.select();
  },

  handleKeyUp : function(e) {
    var element = ReactDOM.findDOMNode(this);
    element.blur();
  }

});

module.exports = Clipboard;
