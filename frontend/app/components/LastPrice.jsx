import React from 'react';

import utils from '../js/utils';

let LastPrice = React.createClass({
  getInitialState: function () {
    return {
      lastMarket: null,
      lastPrice: null,
      priceChange: 'default'
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.market.name == this.state.lastMarket) {
      if (nextProps.market.lastPrice > this.state.lastPrice)
        this.setState({
          priceChange: 'success'
        });
      else if (nextProps.market.lastPrice < this.state.lastPrice)
        this.setState({
          priceChange: 'danger'
        });
    }
    else
      this.setState({
        lastMarket: nextProps.market.name,
        lastPrice: "N/A",
        priceChange: 'default'
      });

    if (nextProps.market.lastPrice && nextProps.market.name) {
      this.setState({
        lastMarket: nextProps.market.name,
        lastPrice: utils.numeral(nextProps.market.lastPrice, String(nextProps.market.precision).length - 1)
      });
    }
  },

  render: function() {
    return (
      <div className="text-overflow" title={this.state.lastPrice}>
        <b>Last price:</b>{' '}
        <span className="text-orange">
          { this.state.lastPrice }
        </span> {(this.state.lastPrice && this.state.lastMarket) ? this.state.lastMarket + "/ETH" : "N/A" }
        <i onClick={this.props.toggleGraph} className={"text-" + this.state.priceChange + " visible-md visible-lg btn btn-xs icon-chart-line"} />
      </div>
    );
  }
});

module.exports = LastPrice;
