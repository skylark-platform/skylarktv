import React from "react";
import MuxVideo from "@mux/mux-video-react";

import dynamic from "next/dynamic";
import { addCloudinaryOnTheFlyImageTransformation } from "../../../lib/utils";
import { Skeleton } from "../skeleton";

export interface PlayerTokens {
  playback: string;
  storyboard?: string;
  thumbnail?: string;
  drm?: string;
}

interface PlayerProps {
  src: string;
  playbackId?: string;
  playbackTokens?: PlayerTokens;
  playbackPolicy?: string;
  poster?: string;
  videoId: string;
  videoTitle: string;
  autoPlay?: boolean;
  provider?: string;
}

const getPlayerType = (src: string, provider?: string, srcId?: string) => {
  if (
    src.startsWith("https://drive.google.com/file") &&
    src.endsWith("/preview")
  ) {
    return "iframe";
  }
  if (src.includes("youtube")) {
    return "react-player";
  }

  if (provider && srcId && provider.toLocaleLowerCase() === "mux") {
    return "mux-player";
  }

  return "mux-video";
};

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
});

const ThumbnailImage = ({ src }: { src?: string }) =>
  src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt="Thumbnail"
      className="h-full w-full bg-black object-cover object-center"
      src={src}
    />
  ) : undefined;

export const Player: React.FC<PlayerProps> = ({
  src,
  playbackId,
  playbackTokens,
  playbackPolicy,
  poster,
  autoPlay,
  videoId,
  videoTitle,
  provider,
}) => {
  const isClient = typeof window !== "undefined";
  const absoluteSrc =
    isClient && src
      ? new URL(
          src,
          `${window.location.protocol}//${window.location.host}`,
        ).toString()
      : undefined;

  const type = getPlayerType(src, provider, playbackId);

  const posterSrc = poster
    ? addCloudinaryOnTheFlyImageTransformation(poster, {
        width: 1000,
      })
    : undefined;

  const isSigned = Boolean(
    !playbackPolicy || ["PRIVATE"].includes(playbackPolicy.toUpperCase()),
  );

  return (
    <div className="w-screen sm:w-11/12 lg:w-3/4 2xl:w-2/3">
      <div className="aspect-h-9 aspect-w-16 relative bg-skylarktv-primary shadow shadow-black md:shadow-xl">
        {/* For Google Drive videos, use iframe embed because they don't work with MuxPlayer */}
        {type === "iframe" && <iframe src={src} />}
        {type === "react-player" && (
          <ReactPlayer
            config={{}}
            controls={true}
            height="100%"
            light={<ThumbnailImage src={posterSrc} />}
            playing={autoPlay}
            style={{ height: "100%", width: "100%" }}
            url={absoluteSrc}
            width="100%"
          />
        )}
        {type === "mux-player" &&
          (isSigned && !playbackTokens ? (
            <>
              <Skeleton image={posterSrc} show />
            </>
          ) : (
            <MuxPlayer
              autoPlay={autoPlay}
              className="h-full w-full bg-black object-cover object-center"
              data-testid="player"
              key={`${playbackId}-${playbackTokens?.playback}`}
              metadata={{
                video_id: videoId,
                video_title: videoTitle,
              }}
              playbackId={playbackId}
              poster={posterSrc}
              ref={undefined}
              streamType={"on-demand"}
              // style={
              //   {
              //     "--fullscreen-button": "none",
              //     "--pip-button": "none",
              //   } as CSSProperties
              // }
              tokens={playbackTokens}
            ></MuxPlayer>
          ))}
        {type === "mux-video" && (
          <MuxVideo
            autoPlay={autoPlay}
            className="h-full w-full bg-black object-cover object-center"
            controls
            data-testid="player"
            metadata={{
              video_id: videoId,
              video_title: videoTitle,
            }}
            poster={posterSrc}
            ref={undefined}
            src={absoluteSrc} // Convert relative URL into absolute
            streamType={"on-demand"}
          />
        )}
      </div>
    </div>
  );
};

export default Player;
