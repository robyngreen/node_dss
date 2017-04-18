import React from 'react';
import 'es6-promise/auto';
import 'isomorphic-fetch';
import Chart from './chart';
import Branding from './branding';
import OnOffline from './on-offline';
import Info from './info';

let timer = '';

export default class Status extends React.Component {
  constructor () {
    super();

    this.addErrorCode = this.addErrorCode.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.updateResponseTime = this.updateResponseTime.bind(this);
    this.setupWebSocket = this.setupWebSocket.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.reconnectServices = this.reconnectServices.bind(this);

    this.ws = null;

    // Get initial state.
    this.state = {
      connectionStatus: false,
      lastResponseTime: [10, 30, 10, 25, 10, 31, 10],
      errorCode: {
        displayName: '---',
        dsn:  '---',
        value: '---'
      }
    };
  }

  setupWebSocket (host) {
    // eslint-disable-next-line no-undef
    this.ws = new WebSocket('ws://' + host + ':8080');

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

  reconnectServices () {
    // Reconnect the backend service.
    // eslint-disable-next-line no-undef
    fetch('/api/v1/restart')
      .then((response) => {
        if (response.status >= 400) {
          throw new Error('Bad response from server');
        }
        return response.json();
      })
      .then(() => {
        // Reconnect client websocket.
        this.setupWebSocket();
      });
  }

  componentDidMount () {
    // eslint-disable-next-line no-undef
    const host = window.document.location.host.replace(/:.*/, '');
    this.setupWebSocket(host);
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
    let timeInSeconds = [Math.floor(time * 0.001)];
    timeInSeconds.push(10);
    this.setState(prevState => ({
      lastResponseTime: prevState
        .lastResponseTime
        .slice(-8)
        .concat(timeInSeconds)
    }));
  }

  render () {
    return (
      <main className='main'>
        <div className='content'>
          <header className='header'>
            <div className='headerInner'>
              <h1>{ this.props.title }</h1>
              <OnOffline connectionStatus={ this.state.connectionStatus } />
            </div>
          </header>
          <div className='wrapper'>
            <Chart heartbeat={ this.state.lastResponseTime } connectionStatus={ this.state.connectionStatus } />
            <Info
              details={ this.state.errorCode }
              connectionStatus={ this.state.connectionStatus }
              reconnectServices={ this.reconnectServices }
              sendMessage={ this.sendMessage } />
          </div>
        </div>
        <Branding connectionStatus={ this.state.connectionStatus } lastResponseTime={ this.state.lastResponseTime } />
        <style jsx>{`
          .main {
            max-width: 800px;
            box-shadow: 0 0 4px rgba(71, 71, 65, 0.58);
          }

          @media (min-width: 800px) {
            .main {
              margin: 40px auto;
            }
          }

          .content {
            position: relative;
            overflow: hidden;
          }

          .header {
            position: absolute;
            display: flex;
            align-items: center;
            background-image: linear-gradient(#dedede, #f4f4f4);;
            font-size: 2rem;
            color: black;
            font-weight: bold;
            text-align: center;
            padding: 20px;
            height: 65vh;
            top: 0;
            left: 0;
            width: 100%;
          }

          @media (min-width: 800px) {
            .header {
              height: 350px;
            }
          }

          .headerInner {
            margin: auto;
          }

          h1 {
            font-size: 1.8rem;
            line-height: 1.1;
          }

          @media screen and (min-width: 30rem) {
            h1 {
              font-size: calc(1.8rem + 5 * ((100vw - 30rem) / 60));
            }
          }

          @media screen and (min-width: 50rem) {
            h1 {
              font-size: 3.2rem;
            }
          }

          h1,
          h2 {
            margin: 0;
          }

          .wrapper {
            position: relative;
            z-index: 5;
            margin-top: 50vh;
          }

          @media screen and (min-width: 440px) {
            .wrapper {
              margin-top: 40vh;
            }
          }

          @media screen and (min-width: 800px) {
            .wrapper {
              margin-top: 150px;
            }
          }
        `}</style>
      </main>
    );
  }
}
