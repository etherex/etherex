var _ = require("lodash");
var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var Button = require('react-bootstrap').Button;
var SubTab = require("./SubTab");

var fixtures = require('../js/fixtures');

var SubNavBar = React.createClass({

  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [IntlMixin],

  getInitialState: function () {
    var marketSections = _.pluck(fixtures.categories, 'key');
    marketSections.push('markets');

    return {
      category: this.context.router.getCurrentRoutes()[1].name,
      marketSections: marketSections
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps) {
      var category = this.context.router.getCurrentRoutes()[1].name;
      this.setState({
        category: category
      });
    }
  },

  render: function() {
    return (
      <div role="navigation" aria-label="Secondary">
        { _.includes(this.state.marketSections, this.state.category) &&
          <div className="visible-xs visible-sm navbar">
            <div className="col-md-12">
              <div className="navbar-toggle btn-block" style={{padding: 0, margin: 0}}>
                <Button bsSize="large" className="text-overflow btn-balance" data-toggle="collapse" data-target="#subnav-collapse">
                  <span className="sr-only">
                    <FormattedMessage message={this.getIntlMessage('nav.toggle')} />
                  </span>
                  <div className="text-center">
                    <FormattedMessage message={this.getIntlMessage('nav.categories')} />
                  </div>
                </Button>
              </div>
            </div>
          </div>
        }
        <div className="collapse navbar-collapse row" id="subnav-collapse">
          <ul className="nav navbar nav-pills nav-lg nav-justified">
            <SubTab to="subs" data-toggle="collapse" data-target="#subnav-collapse.in">
              <i className="icon-chart-pie"></i> <FormattedMessage message={this.getIntlMessage('sections.sub')} />
            </SubTab>
            <SubTab to="xchain" data-toggle="collapse" data-target="#subnav-collapse.in">
              <i className="icon-bitcoin"></i> <FormattedMessage message={this.getIntlMessage('sections.xchain')} />
            </SubTab>
            <SubTab to="assets" data-toggle="collapse" data-target="#subnav-collapse.in">
              <i className="icon-diamond"></i> <FormattedMessage message={this.getIntlMessage('sections.assets')} />
            </SubTab>
            <SubTab to="currencies" data-toggle="collapse" data-target="#subnav-collapse.in">
              <i className="icon-money"></i> <FormattedMessage message={this.getIntlMessage('sections.currencies')} />
            </SubTab>
          </ul>
        </div>
      </div>
    );
  }
});

module.exports = SubNavBar;
