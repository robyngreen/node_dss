import Status from '../components/status';
import Head from 'next/head';

export default () => (
  <div>
    <Head>
      <title>DSS Status Update ⚡️</title>
      <meta charSet='utf-8' />
      <meta name='viewport' content='initial-scale=1.0, width=device-width' />
    </Head>
    <Status title="DSS Status Update" />
    <style jsx global>{`
      html {
        font-family: 'Gotham SSm A', 'Gotham SSm B', 'Gotham', Sans-Serif;
        box-sizing: border-box;
        line-height: 1.15;
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
        font-size: 100%;
      }

      * {
        box-sizing: inherit;
      }

      *::before,
      *::after {
        box-sizing: inherit;
      }

      body {
        margin: 0;
        font-size: 0.875rem;
        line-height: 1.785;
        letter-spacing: -0.04rem;
        color: #000;
      }
    `}</style>
  </div>
);
