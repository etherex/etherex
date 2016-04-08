import React from 'react';
let linkEl;

let drawIcon = function (src, num, cb) {
  var img = document.createElement('img');
  img.onload = function () {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    var context = canvas.getContext('2d');
    context.clearRect(0, 0, img.width, img.height);
    context.drawImage(img, 0, 0);

    var top = img.height / 2 - 6,
        left = img.width / 2 - 6,
        bottom = img.height,
        right = img.width,
        radius = 8;

    context.fillStyle = '#F03D25';
    context.strokeStyle = '#F03D25';
    context.lineWidth = 1;

    context.beginPath();
    context.moveTo(left + radius, top);
    context.quadraticCurveTo(left, top, left, top + radius);
    context.lineTo(left, bottom - radius);
    context.quadraticCurveTo(left, bottom, left + radius, bottom);
    context.lineTo(right - radius, bottom);
    context.quadraticCurveTo(right, bottom, right, bottom - radius);
    context.lineTo(right, top + radius);
    context.quadraticCurveTo(right, top, right - radius, top);
    context.closePath();
    context.fill();

    context.font = '16px Arial';
    context.fillStyle = '#FFF';
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.fillText(num, img.height / 2 + 5, img.height / 2 - 3);

    cb(null, context.canvas.toDataURL());
  };
  img.src = src;
};

var Favicon = React.createClass({
  displayName: 'Favicon',

  statics: {
    mountedInstances: [],

    getActiveInstance() {
      return Favicon.mountedInstances[Favicon.mountedInstances.length - 1];
    },

    draw() {
      if (typeof document === 'undefined')
        return;

      if (typeof linkEl === 'undefined') {
        var head = document.getElementsByTagName('head')[0];
        linkEl = document.createElement('link');
        linkEl.type = 'image/x-icon';
        linkEl.rel = 'icon';

        // remove existing favicons
        var links = head.getElementsByTagName('link');
        for (var i = links.length; --i >= 0; /\bicon\b/i.test(links[i].getAttribute('rel'))) {
          head.removeChild(links[i]);
        }

        head.appendChild(linkEl);
      }

      var activeInstance = Favicon.getActiveInstance();
      var currentUrl;

      if (activeInstance.props.url instanceof Array)
        currentUrl = activeInstance.props.url[activeInstance.state.animationIndex];
      else
        currentUrl = activeInstance.props.url;

      if (activeInstance.props.alertCount) {
        drawIcon(currentUrl, activeInstance.props.alertCount, function (err, url) {
          linkEl.href = url;
        });
      }
      else
        linkEl.href = currentUrl;
    },

    update() {
      if (typeof document === 'undefined')
        return;

      var activeInstance = Favicon.getActiveInstance();
      var isAnimated = activeInstance.props.url instanceof Array && activeInstance.props.animated;

      // clear any running animations
      var intervalId = null;
      clearInterval(activeInstance.state.animationLoop);

      if (isAnimated) {
        var animateFavicon = function() {
          var nextAnimationIndex = (activeInstance.state.animationIndex + 1) % activeInstance.props.url.length;
          Favicon.draw();
          activeInstance.setState({ animationIndex: nextAnimationIndex });
        };
        intervalId = setInterval(animateFavicon, activeInstance.props.animationDelay);
        animateFavicon();
      } else {
        Favicon.draw();
      }

      activeInstance.setState({ animationLoop: intervalId });
    }
  },

  getDefaultProps() {
    return {
      alertCount: null,
      animated: true,
      animationDelay: 500
    };
  },

  getInitialState() {
    return {
      animationIndex: 0,
      animationLoop: null,
      animationRunning: false
    };
  },

  componentWillMount() {
    Favicon.mountedInstances.push(this);
    Favicon.update();
  },

  shouldComponentUpdate(nextProps) {
    if (nextProps.alertCount === this.props.alertCount)
      return false;
    return true;
  },

  componentDidUpdate(prevProps) {
    if (prevProps.url === this.props.url &&
        prevProps.animated === this.props.animated &&
        prevProps.alertCount === this.props.alertCount) return;
    Favicon.update();
  },

  render() {
    return null;
  }
});

module.exports = Favicon;
