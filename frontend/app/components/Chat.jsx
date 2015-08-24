var _ = require("lodash");
var React = require("react");
var ReactIntl = require("react-intl");
var FormattedTime = ReactIntl.FormattedTime;

var Accordion = require('react-bootstrap/lib/Accordion');
var Glyphicon = require("react-bootstrap/lib/Glyphicon");
var Button = require('react-bootstrap/lib/Button');
var Modal = require('react-bootstrap/lib/Modal');
var Panel = require('react-bootstrap/lib/Panel');
var Input = require('react-bootstrap/lib/Input');
var Well = require('react-bootstrap/lib/Well');

var Chat = React.createClass({
  getInitialState() {
    return {
      activeKey: null,
      messages: [],
      message: null,
      showModal: false,
      modalMessage: null
    };
  },

  componentWillReceiveProps(nextProps) {
    this.setState({
      messages: _.sortByOrder(nextProps.market.messages, 'sent', 'desc')
    });
  },

  hideModal() {
    this.setState({
      showModal: false
    });
  },

  toggleActive(key) {
    this.setState({ activeKey: this.state.activeKey ? null : key});
  },

  handleChange(e) {
    e.preventDefault();
    this.setState({
      message: this.refs.message.getValue()
    });
  },

  handleSend(e) {
    e.preventDefault();
    var ethereumClient = this.props.flux.store('config').getEthereumClient();
    if (ethereumClient.hasWhisper())
      this.props.flux.actions.market.postMessage(this.state.message);
    else
      this.setState({
        showModal: true,
        modalMessage: <div>
          Whisper is not enabled on this node. Start <samp>geth</samp> with:<p><pre>--shh --rpcapi "db,eth,net,web3,shh"</pre></p>
        </div>
      });
    this.setState({
      message: null
    });
  },

  render() {
    return (
      <div className={ (this.state.activeKey ? "col-xs-4" : "col-xs-2") + " chatbox"}>
        <Accordion activeKey={this.state.activeKey} onSelect={this.toggleActive}>
          <Panel header={
              <span>{ this.props.market.name } whispers
                { this.state.activeKey && <span className="pull-right"><Glyphicon glyph="remove" onClick={this.toggleActive} /></span> }
              </span>
            } bsStyle="primary" eventKey='1'>
            <Well bsSize="small" className="chatbox-messages">
              { this.state.messages.map( function(message, i) {
                  if (!message.error)
                    return (
                      <div key={message.from + '-' + i}>
                        [{ message.sent && <FormattedTime value={message.sent} hour="numeric" minute="numeric" /> }]{' '}
                        { message.from && message.from.substr(2, 7)}: { message.payload }
                      </div>
                    );
                })
              }
            </Well>
            <form className="form-horizontal" onSubmit={this.handleSend}>
              <div className="container-fluid">
                <Input type="text" ref="message" value={ this.state.message } onChange={this.handleChange} />
              </div>
              <Button type="submit" bsStyle="primary" bsSize="medium" className="hidden pull-right">Send</Button>
            </form>
          </Panel>
        </Accordion>

        <Modal show={this.state.showModal} animation={true} onHide={this.hideModal}>
          <Modal.Header closeButton>
            <Modal.Title>Oh snap!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <big><p>{this.state.modalMessage}</p></big>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.hideModal}>Got it</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
});

module.exports = Chat;
