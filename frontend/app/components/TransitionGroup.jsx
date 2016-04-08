/**
 * The CSSTransitionGroup component uses the 'transitionend' event, which
 * browsers will not send for any number of reasons, including the
 * transitioning node not being painted or in an unfocused tab.
 *
 * This TimeoutTransitionGroup instead uses a user-defined timeout to determine
 * when it is a good time to remove the component. Currently there is only one
 * timeout specified, but in the future it would be nice to be able to specify
 * separate timeouts for enter and leave, in case the timeouts for those
 * animations differ. Even nicer would be some sort of inspection of the CSS to
 * automatically determine the duration of the animation or transition.
 *
 * This is adapted from Facebook's CSSTransitionGroup which is in the React
 * addons and under the Apache 2.0 License.
 */

import React from 'react';
import ReactTransitionGroup from 'react-addons-transition-group';
import TransitionGroupChild from './TransitionGroupChild';

let TransitionGroup = React.createClass({
    propTypes: {
        enterTimeout: React.PropTypes.number.isRequired,
        leaveTimeout: React.PropTypes.number.isRequired,
        transitionName: React.PropTypes.string.isRequired,
        transitionEnter: React.PropTypes.bool,
        transitionLeave: React.PropTypes.bool
    },

    getDefaultProps: function() {
        return {
            transitionEnter: true,
            transitionLeave: true
        };
    },

    _wrapChild: function(child) {
        return (
            <TransitionGroupChild
                    enterTimeout={this.props.enterTimeout}
                    leaveTimeout={this.props.leaveTimeout}
                    name={this.props.transitionName}
                    enter={this.props.transitionEnter}
                    leave={this.props.transitionLeave}>
                {child}
            </TransitionGroupChild>
        );
    },

    render: function() {
        return (
            <ReactTransitionGroup
                {...this.props}
                childFactory={this._wrapChild} />
        );
    }
});

module.exports = TransitionGroup;
