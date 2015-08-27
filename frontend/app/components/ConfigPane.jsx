var React = require("react");
var ReactIntl = require("react-intl");
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var Button = require('react-bootstrap/lib/Button');
var Alert = require('react-bootstrap/lib/Alert');
var Input = require('react-bootstrap/lib/Input');
var ConfirmModal = require('./ConfirmModal');

var ConfigPane = React.createClass({
  mixins: [IntlMixin],

  getInitialState: function() {
    var configState = this.props.flux.store("config").getState();
    return {
      address: this.props.address,
      newAddress: false,
      debug: configState.debug,
      si: configState.si,
      timeout: configState.timeout,
      timeoutUpdated: false,
      message: null,
      theme: localStorage.theme || 'flatly',
      themes: {
        'flatly': 'Flatly',
        'darkly': 'Darkly',
        'superhero': 'Superhero'
      },
      newTheme: false,
      showModal: false,
      handler: false
    };
  },

  componentWillReceiveProps(nextProps) {
    var config = nextProps.flux.store('config');
    if (config.si != this.state.si)
      this.setState({
        si: config.si
      });
    if (config.debug != this.state.debug)
      this.setState({
        debug: config.debug
      });
    if (config.timeout != this.state.timeout && !this.state.timeoutUpdated)
      this.setState({
        timeout: config.timeout
      });
  },

  closeModal: function() {
    this.setState({ showModal: false });
  },

  openModal: function() {
    this.setState({ showModal: true });
  },

  toggleDebug: function() {
    var debug = this.refs.debug.getChecked();

    this.setState({ debug: debug });

    this.props.flux.actions.config.updateConfig({
      debug: debug
    });
  },

  toggleSI: function() {
    var si = this.refs.si.getChecked();
    this.setState({ si: si });
    this.props.flux.actions.config.updateConfig({
      si: si
    });
  },

  handleChangeTheme(e, theme) {
    e.preventDefault();

    this.setState({
      theme: theme,
      newTheme: true
    });
  },

  handleUpdateTheme(e) {
    e.preventDefault();
    localStorage.theme = this.state.theme;
    window.location.reload();
  },

  handleChangeTimeout(e) {
    e.preventDefault();
    var timeout = this.refs.timeout.getValue();
    this.setState({ timeout: timeout, timeoutUpdated: true });
  },

  handleTimeout: function(e) {
    e.preventDefault();
    var timeout = this.refs.timeout.getValue();
    this.setState({ timeout: timeout, timeoutUpdated: false });
    this.props.flux.actions.config.updateConfig({
      timeout: timeout
    });
  },

  handleChange: function(e) {
    e.preventDefault();
    this.validate(e);
  },

  handleValidation: function(e) {
    e.preventDefault();
    if (this.validate(e, true))
      this.openModal();
  },

  validate: function(e, showAlerts) {
    e.preventDefault();
    var address = this.refs.address.getValue().trim();
    this.setState({
      address: address
    });

    if (!address) {
      this.props.setAlert('warning', this.formatMessage(this.getIntlMessage('form.empty')));
    }
    else if (address.length != 42) {
      this.props.setAlert('warning',
        this.formatMessage(this.getIntlMessage('address.size'), {
          size: (address.length < 42 ? "short" : "long")
        })
      );
    }
    else {
      this.setState({
        message: this.formatMessage(
          this.getIntlMessage('config.address'), {
            address: this.state.address
          }),
        newAddress: true
      });

      this.props.showAlert(false);

      return true;
    }

    this.setState({
      newAddress: false
    });

    if (showAlerts)
      this.props.showAlert(true);

    return false;
  },

  onSubmitForm: function(e, el) {
    e.preventDefault();

    if (!this.validate(e, el))
      return false;

    this.props.flux.actions.config.updateAddress({
      address: this.state.address
    });

    this.refs.address.getDOMNode().value = '';
  },

  render: function() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">
            <FormattedMessage message={this.getIntlMessage('config.title')} />
          </h3>
        </div>
        <div className="panel-body">

          <form className="form-horizontal" role="form" onSubmit={this.handleUpdateTheme} >
            <Input label="Theme" labelClassName='col-sm-3' wrapperClassName='col-sm-9 wrapper'>
              <DropdownButton ref="theme" title={this.state.themes[this.state.theme]} onSelect={this.handleChangeTheme}>
                <MenuItem key={"flatly"} eventKey={"flatly"}>Flatly</MenuItem>
                <MenuItem key={"darkly"} eventKey={"darkly"}>Darkly</MenuItem>
                <MenuItem key={"superhero"} eventKey={"superhero"}>Superhero</MenuItem>
              </DropdownButton>
              <Button style={{marginLeft: 10}} className={this.state.newTheme && " btn-primary"} type="submit">
                <FormattedMessage message={this.getIntlMessage('config.refresh')} />
              </Button>
            </Input>
          </form>

          <form className="form-horizontal" role="form" onSubmit={this.handleValidation} >
            <Input type='text' label={<FormattedMessage message={this.getIntlMessage('config.current')} />}
              labelClassName='col-sm-3' wrapperClassName='col-sm-9'
              value={this.props.address} readOnly hasFeedback />

            <Input type='text' label={<FormattedMessage message={this.getIntlMessage('config.new')} />}
              labelClassName='col-sm-3' wrapperClassName='col-sm-9'
              maxLength="42" pattern="0x[a-fA-F\d]+" placeholder="Address" ref="address" onChange={this.handleChange}/>
            <Input wrapperClassName="col-sm-9 col-sm-offset-3">
              <Button className={"btn-block" + (this.state.newAddress ? " btn-primary" : "")} type="submit">
                <FormattedMessage message={this.getIntlMessage('config.update')} />
              </Button>
            </Input>
          </form>

          <form className="form-horizontal" role="form" onSubmit={this.handleTimeout} >
            <Input ref="timeout" type="number" min="1" step="1"
              label={<FormattedMessage message={this.getIntlMessage('config.timeout')} />}
              labelClassName='col-sm-3' wrapperClassName='col-sm-9'
              value={this.state.timeout} onChange={this.handleChangeTimeout} />
            <Input wrapperClassName="col-sm-9 col-sm-offset-3">
              <Button
                onClick={this.handleTimeout}
                wrapperClassName="col-sm-9 col-sm-offset-3"
                className={this.state.timeoutUpdated ? "btn-primary" : ""} >
                <FormattedMessage message={this.getIntlMessage('config.update')} />
              </Button>
            </Input>
          </form>

          <Input type='checkbox' ref='si' label={<FormattedMessage message={this.getIntlMessage('config.si')} />}
            wrapperClassName="col-sm-9 col-sm-offset-3"
            checked={this.state.si} onChange={this.toggleSI} />

          <Input type='checkbox' ref='debug' label={<FormattedMessage message={this.getIntlMessage('config.debug_mode')} />}
            wrapperClassName="col-sm-9 col-sm-offset-3"
            checked={this.state.debug} onChange={this.toggleDebug}
            help={
              <Alert bsStyle='warning' className='text-black'>
                <b><FormattedMessage message={this.getIntlMessage('form.warning')} /></b>{' '}
                <FormattedMessage message={this.getIntlMessage('config.debug_warning')} />
              </Alert>} />
        </div>
        <ConfirmModal
          show={this.state.showModal}
          onHide={this.closeModal}
          message={this.state.message}
          flux={this.props.flux}
          onSubmit={this.onSubmitForm}
        />
      </div>
    );
  }
});

module.exports = ConfigPane;
