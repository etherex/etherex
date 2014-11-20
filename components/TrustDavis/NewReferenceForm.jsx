/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var NewReferenceForm = React.createClass({
  mixins: [FluxChildMixin],
  render: function() {
    return (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">New Reference</h3>
          </div>
          <div className="panel-body">
            <form className="form-inline" onSubmit={this.onSubmitForm}>
                I want to insure <input type="text" className="form-control" pattern="\w{1,32}" placeholder="person" ref="trader" />
                {' '}
                with a maximum liability of
                {' '}
                <input type="number" min="0" step="0.0001" className="form-control small" placeholder="0.0000" ref="maxLiability" /> ETH
                {' '}
                for a premium of <input type="number" min="0" step="0.1" className="form-control small" placeholder="0.0" ref="premiumPct" /> %
                {' '}
                <button type="submit" className="btn btn-default">Create</button>
            </form>
          </div>
        </div>
    );
  },
  onSubmitForm: function(e) {
    e.preventDefault();
    var trader = this.refs.trader.getDOMNode().value.trim();
    var maxLiability = this.refs.maxLiability.getDOMNode().value.trim();
    var premiumPct = this.refs.premiumPct.getDOMNode().value.trim();

    if (!trader || !maxLiability || !premiumPct) {
      return false;
    }
    this.getFlux().actions.reference.addReference({
        id: trader,
        maxLiability: maxLiability,
        premiumPct: premiumPct
    });

    this.refs.trader.getDOMNode().value = '';
    this.refs.maxLiability.getDOMNode().value = '';
    this.refs.premiumPct.getDOMNode().value = '';
    return false;
  }
});

module.exports = NewReferenceForm;
