import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/assets/logo/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/assets/logo/favicon.svg" />
        <meta name="description" content="Trady AI - Your AI-Powered Stock Analysis Co-Pilot" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
