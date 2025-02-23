import "../styles/globals.css";
import "@fontsource/figtree/400.css";
import "@fontsource/figtree/500.css";
import "@fontsource/figtree/700.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import type { AppProps } from "next/app";
import PlausibleProvider from "next-plausible";
import { withPasswordProtect } from "next-password-protect";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { IntercomProvider } from "react-use-intercom";
import { useRouter } from "next/router";
import { SkylarkTVLayout } from "../components/layout";
import { DimensionsContextProvider } from "../contexts";
import { CLIENT_APP_CONFIG, LOCAL_STORAGE } from "../constants/app";
import { configureSegment, segment } from "../lib/segment";
import { SEGMENT_WRITE_KEY, AMPLITUDE_API_KEY } from "../constants/env";

const IntercomWrapper = ({ children }: { children: ReactNode }) =>
  CLIENT_APP_CONFIG.withIntercom ? (
    <IntercomProvider appId={"t104fsur"} autoBoot>
      {children}
    </IntercomProvider>
  ) : (
    children
  );

const SegmentWrapper = ({ children }: { children: ReactNode }) => {
  const withSegment =
    CLIENT_APP_CONFIG.withSegment && SEGMENT_WRITE_KEY && AMPLITUDE_API_KEY;

  const router = useRouter();

  useEffect(() => {
    if (withSegment) {
      configureSegment();
    }
  }, []);

  useEffect(() => {
    const segmentPage = () => {
      if (withSegment) {
        void segment.page();
      }
    };

    segmentPage();

    router.events.on("routeChangeComplete", segmentPage);

    return () => {
      router.events.off("routeChangeComplete", segmentPage);
    };
  }, [router.events]);

  return children;
};

function MyApp({ Component, pageProps }: AppProps) {
  const [skylarkApiUrl, setSkylarkApiUrl] = useState(
    process.env.NEXT_PUBLIC_SAAS_API_ENDPOINT,
  );

  useEffect(() => {
    const update = () => {
      const url =
        window.localStorage.getItem(LOCAL_STORAGE.apikey) &&
        window.localStorage.getItem(LOCAL_STORAGE.uri);
      setSkylarkApiUrl(url || process.env.NEXT_PUBLIC_SAAS_API_ENDPOINT);
    };
    update();

    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("storage", update);
    };
  }, []);

  const queryClient = new QueryClient();

  return (
    <SegmentWrapper>
      <PlausibleProvider domain={process.env.NEXT_PUBLIC_APP_DOMAIN as string}>
        <QueryClientProvider client={queryClient}>
          <IntercomWrapper>
            <DimensionsContextProvider>
              <SkylarkTVLayout skylarkApiUrl={skylarkApiUrl}>
                <Component {...pageProps} />
              </SkylarkTVLayout>
            </DimensionsContextProvider>
          </IntercomWrapper>
        </QueryClientProvider>
      </PlausibleProvider>
    </SegmentWrapper>
  );
}

export default process.env.NEXT_PUBLIC_PASSWORD_PROTECT
  ? withPasswordProtect(MyApp)
  : MyApp;
