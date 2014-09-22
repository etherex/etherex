/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var Router = require("react-router");
var Link = Router.Link;

var Tab = require("./Tab");
var UserLink = require("./UserLink");

var NavBar = React.createClass({
    mixins: [FluxChildMixin],

    render: function() {
        return (
            <nav className="navbar navbar-default" role="navigation" aria-label="Primary">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#navbar-collapse">
                            <span className="sr-only">Toggle navigation</span>
                            <span className="btn-xs glyphicon glyphicon-th-list"></span>
                        </button>
                        <Link className="navbar-brand" to="trades">EtherEx</Link>
                    </div>
                    <div className="nav">
                        <div className="collapse navbar-collapse" id="navbar-collapse">
                            <ul className="nav navbar-nav">
                                <Tab to="trades" className="icon-chart-line">Trades</Tab>
                                <Tab to="assets" className="icon-bitcoin">Assets</Tab>
                                <Tab to="wallet" className="icon-wallet">Wallet</Tab>
                                <Tab to="tools" className="icon-cog-alt">Tools</Tab>
                                <Tab to="help" className="icon-help">Help</Tab>
                            </ul>
                            <ul className="nav navbar-nav navbar-right">
                                <li>
                                    {this.props.user.loading ?
                                        <p className="navbar-text"><i className="fa fa-spinner fa-spin"></i></p> :
                                        <UserLink id={this.props.user.user.id} showIcon={true} />}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }
});

module.exports = NavBar;
