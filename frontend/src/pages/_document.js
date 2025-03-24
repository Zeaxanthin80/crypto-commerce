import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Add any global meta tags here */}
        <meta name="description" content="Cryptocurrency E-commerce Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
        {/* Script to detect MetaMask */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                window.hasMetaMask = typeof window.ethereum !== 'undefined';
              });
            `,
          }}
        />
      </body>
    </Html>
  );
}
