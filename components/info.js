import Button from './button';

const Info = ( props ) => {
  return (
    <div className='info'>
      <div className='column'>
        <h3>Last Error Code:</h3>
        <p className='code'>{ props.details.displayName }</p>
        <p><strong>DSN:</strong> { props.details.dsn }</p>
        <p><strong>Value:</strong> { props.details.value }</p>
      </div>
      <div className='column'>
        { props.connectionStatus && <Button clickEvent={ props.sendMessage }>Send Test Message</Button> }
        { !props.connectionStatus && <Button clickEvent={ props.reconnectServices }>Reconnect Services</Button> }
      </div>
      <style jsx>{`
        .info {
          background-color: #474741;
          color: white;
          padding: 30px 26px;
        }

        @media (min-width: 600px) {
          .info {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }

        .column + .column {
          margin-top: 20px;
        }

        @media (min-width: 600px) {
          .column {
            flex: 0 1 auto;
          }

          .column + .column {
            margin-top: 0;
          }
        }

        h3 {
          margin: 0 0 5px;
          font-weight: bold;
          font-size: 1rem;
          line-height: 1.1;
        }

        .code {
          font-size: 1.5rem;
        }

        p {
          font-size: 1rem;
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default Info;
