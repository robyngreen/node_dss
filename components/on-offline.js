const OnOffline = ( props ) => {
  return (
    <h2 className={ (props.connectionStatus) ? 'online' : 'offline' }>
      <div className="led"></div> Status: { (props.connectionStatus) ? 'Connected to Ayla' : 'No connection from Ayla' }
      <style jsx>{`
        h2 {
          font-size: 1.2rem;
          font-weight: 200;
          margin: 10px 0 0;
        }

        @media screen and (min-width: 32em) {
          h2 {
            font-size: 1.5rem;
          }
        }

        .led {
          width: 15px;
          height: 15px;
          border-radius: 100%;
          display: inline-block;
          vertial-align: middle;
          margin-right: 5px;
          position: relative;
        }

        .led::before,
        .led::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 100%;
          opacity: 0;
        }

        .led::before {
          transform: scale(1);
          animation: pulse 3s infinite linear;
        }

        .led::after {
          animation: pulse 3s 2s infinite linear;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.6);
            opacity: 0;
          }
          33% {
            transform: scale(1.5);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .online :global(.led) {
          background-image: linear-gradient(to bottom,  #17d766 0%,#17d766 50%,#16cf62 51%,#16cf62 100%);
        }

        .offline :global(.led) {
          background: linear-gradient(to bottom,  #f23311 0%,#f23311 50%,#e32c0c 51%,#e32c0c 100%);
        }

        .online :global(.led)::before,
        .online :global(.led)::after {
          background: rgba(22, 207, 98, 0.2);
        }

        .offline :global(.led)::before,
        .offline :global(.led)::after {
          background: rgba(227, 44, 12, 0.2);
        }
      `}</style>
    </h2>
  );
};

export default OnOffline;
