import { Head, Html, Main, NextScript } from "next/document";
import { CLIENT_APP_CONFIG } from "../constants/app";

export default function Document() {
  return (
    <Html dir="ltr" lang="en">
      <Head>
        <link
          href={CLIENT_APP_CONFIG.favicon || "/apple-touch-icon.png"}
          rel="apple-touch-icon"
          sizes="180x180"
        />
        <link
          href={CLIENT_APP_CONFIG.favicon || "/favicon-32x32.png"}
          rel="icon"
          sizes="32x32"
          type="image/png"
        />
        <link
          href={CLIENT_APP_CONFIG.favicon || "/favicon-16x16.png"}
          rel="icon"
          sizes="16x16"
          type="image/png"
        />
        <link href="/site.webmanifest" rel="manifest" />
        <script
          async
          src="https://cdn.whisk.com/sdk/shopping-list.js"
          type="text/javascript"
        ></script>
      </Head>
      <body className="overflow-x-hidden bg-gray-900 font-body">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
