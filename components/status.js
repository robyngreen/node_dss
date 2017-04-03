import React from 'react';

// eslint-disable-next-line no-undef
// const ws = new WebSocket('ws://localhost:8080');

export default class Status extends React.Component {
  constructor () {
    super();

    this.addErrorCode = this.addErrorCode.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.updateResponseTime = this.updateResponseTime.bind(this);

    // Get initial state.
    this.state = {
      connectionStatus: false,
      lastResponseTime: 0,
      errorCode: {}
    };
  }

  componentDidMount () {
    // eslint-disable-next-line no-undef
    // @todo: This may need to reflect the actual server URL.
    const ws = new WebSocket('ws://localhost:8080');
    ws.onmessage = (message) => {
      console.log('======== Message received ========');

      const data = JSON.parse(message.data);

      if (data.metadata !== undefined) {
        // Parse the message data and pull out the fields we need.
        const output = {
          displayName: data.metadata.display_name,
          dsn:  data.metadata.dsn,
          value: data.datapoint.value
        };
        this.addErrorCode(output);
      }

      if (data.connected !== undefined) {
        this.updateStatus(data.connected);
      }

      if (data.responseTime !== undefined) {
        console.log(data.responseTime);
        this.updateResponseTime(data.responseTime);
      }
    };
  }

  addErrorCode (code) {
    // Update state.
    this.setState({ errorCode: code });
  }

  updateStatus (status) {
    // Update state.
    this.setState({ connectionStatus: status });
  }

  updateResponseTime (time) {
    // Update state.
    this.setState({ lastResponseTime: time });
  }

  render () {
    return (
      <main className='main'>
        <h1>{ this.props.title }</h1>
        <h2>Status: { (this.state.connectionStatus === true) ? 'Online' : 'Offline' }</h2>
        <p>Last Error Code: { this.state.errorCode.displayName }</p>
        <p>DSN: { this.state.errorCode.dsn }</p>
        <p>Value: { this.state.errorCode.value }</p>
        <small>Responded in { Math.floor(this.state.lastResponseTime * 0.001) } seconds</small>
        <style jsx>{`
          .main {
            font: 16px Helvetica, Arial;
            border: 1px solid #eee;
            padding: 20px;
            max-width: 800px;
            margin: 20px auto;
          }

          h1 {
            font-size: 32px;
            font-weight: bold;
            margin: 0 0 10px;
          }
        `}</style>
      </main>
    )
  }
};
