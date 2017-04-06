import React from 'react';
import Button from './button';
let timer = '';

export default class Status extends React.Component {
  constructor () {
    super();

    this.addErrorCode = this.addErrorCode.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.updateResponseTime = this.updateResponseTime.bind(this);
    this.setupWebSocket = this.setupWebSocket.bind(this);
    this.sendMessage = this.sendMessage.bind(this);

    this.ws = null;

    // Get initial state.
    this.state = {
      connectionStatus: false,
      lastResponseTime: 0,
      errorCode: {}
    };
  }

  setupWebSocket () {
    // @todo: This may need to reflect the actual server URL.
    // eslint-disable-next-line no-undef
    this.ws = new WebSocket('ws://localhost:8080');

    this.ws.onmessage = (message) => {
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
        this.updateResponseTime(data.responseTime);
      }
    };
  }

  componentDidMount () {
    this.setupWebSocket();
  }

  sendMessage () {
    this.ws.send(JSON.stringify({
      status: 'test'
    }));
  }

  addErrorCode (code) {
    // Update state.
    this.setState({ errorCode: code });
  }

  updateStatus (status) {
    // If connection is false, try to reconnect.
    if (status === false) {
      // Try every 30 seconds.
      let timerCounter = 0;
      timer = setInterval(() => {
        timerCounter++;
        console.log(`attempting to reconnect...${ timerCounter }`);
        // Limit the retries to 5.
        // Also clear the timer if the status is now true.
        if (timerCounter === 5 || this.state.status === true) {
          clearInterval(timer);
        }
        // Attempt to connect again.
        this.setupWebSocket();
      }, 30000);
    }
    // Else stop trying to reconnect.
    // Clear the timer if it's set.
    else if (timer) {
      clearInterval(timer);
    }

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
        <h2>{ (this.state.connectionStatus) ? 'Online: Connected to Ayla' : 'Offline: No connection from Ayla' }</h2>
        <p>Last Error Code: { this.state.errorCode.displayName }</p>
        <p>DSN: { this.state.errorCode.dsn }</p>
        <p>Value: { this.state.errorCode.value }</p>
        <p><small>{
          (this.state.connectionStatus) ?
            `Last response from Ayla took ${ Math.floor(this.state.lastResponseTime * 0.001) } seconds`
            : 'Offline'
        }</small></p>
        { this.state.connectionStatus && <Button addClasses='btn' clickEvent={ this.sendMessage }>Send Test Message</Button> }
        { !this.state.connectionStatus && <Button addClasses='btn' clickEvent={ this.setupWebSocket }>Reconnect</Button> }
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
    );
  }
}
