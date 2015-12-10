import React from 'react';

let Help = React.createClass({
  render: function() {
    return (
      <div className="container-fluid">
        <h1>{this.props.title}</h1>
        <section className="text-center">
          <h3>See the <a href="https://github.com/etherex/etherex#readme" target="_blank">GitHub readme</a> for documentation</h3>
          <h4>Or the <a href="https://etherex.org/faq" target="_blank">FAQ</a> on the <a href="https://etherex.org" target="_blank">website</a></h4>
          <p>Complete dApp documentation will be here soon.</p>
        </section>
      </div>
    );
  }
});

module.exports = Help;
