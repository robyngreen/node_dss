import { Sparklines, SparklinesLine } from 'react-sparklines';

const Chart = ( props ) => {
  return (
    <div className='chart'>
      <Sparklines data={ props.heartbeat } limit={10} max={60}>
        <SparklinesLine style={{ strokeWidth: 10, stroke: '#474741', fill: '#474741', fillOpacity: '1' }} />
      </Sparklines>
      <style jsx>{`
        .chart :global(svg) {
          display: block;
          background-color: transparent;
          overflow: hidden;
          margin-bottom: -10px;
          margin-left: -10px;
          margin-right: -10px;
        }
      `}</style>
    </div>
  );
};

export default Chart;
