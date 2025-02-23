import React, { CSSProperties, ReactNode, useState } from "react";
import MuxVideo from "@mux/mux-video-react";
import type MuxPlayerElement from "@mux/mux-player";

import dynamic from "next/dynamic";
import {
  addCloudinaryOnTheFlyImageTransformation,
  hasProperty,
} from "../../../lib/utils";
import { Skeleton } from "../skeleton";

export interface PlayerTokens {
  playback: string;
  storyboard?: string;
  thumbnail?: string;
  drm?: string;
}

export interface PlayerCuePoint<T extends object> {
  uid: string;
  title?: string;
  startTime: number;
  endTime?: number;
  payload: T;
}

export interface PlayerChapter<T extends object> {
  uid: string;
  title?: string;
  startTime: number;
  endTime?: number;
  cuePoints?: PlayerCuePoint<T>[];
}

interface PlayerProps<T extends object> {
  src: string;
  playbackId?: string;
  playbackTokens?: PlayerTokens;
  playbackPolicy?: string;
  poster?: string;
  videoId: string;
  videoTitle: string;
  autoPlay?: boolean;
  provider?: string;
  pauseOverlay?: ReactNode;
  chapters?: PlayerChapter<T>[];
  cuePoints?: PlayerCuePoint<T>[];
  onChapterChange?: (chapter: PlayerChapter<T> | null) => void;
  onCuePointChange?: (cuePoint: PlayerCuePoint<T> | null) => void;
  onPlayToggle?: (evt: { type: "play" | "pause"; currentTime: number }) => void;
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

export function Player<T extends object>({
  src,
  playbackId,
  playbackTokens,
  playbackPolicy,
  poster,
  autoPlay,
  videoId,
  videoTitle,
  provider,
  chapters,
  cuePoints,
  pauseOverlay,
  onChapterChange,
  onCuePointChange,
  onPlayToggle,
}: PlayerProps<T>) {
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
    playbackPolicy && ["PRIVATE"].includes(playbackPolicy.toUpperCase()),
  );

  const addChaptersAndCuePointsToPlayer = async (player: MuxPlayerElement) => {
    if (chapters) {
      const muxChapters = chapters.map((chapter) => ({
        startTime: chapter.startTime,
        endTime: chapter.endTime as number,
        value: chapter.title as string,
      }));
      await player.addChapters(muxChapters);
    }

    if (cuePoints) {
      const muxCuePoints = cuePoints.map((cuePoint) => ({
        time: cuePoint.startTime,
        value: cuePoint.payload,
      }));
      await player.addCuePoints(muxCuePoints);
    }
  };

  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="w-screen sm:w-11/12 lg:w-3/4 2xl:w-2/3">
      <div
        className="aspect-h-9 aspect-w-16 relative shadow shadow-black md:shadow-xl"
        id="my-player"
      >
        {!isPlaying && pauseOverlay && (
          <div
            className="absolute z-[1] h-full w-full"
            data-play-pause-overlay="true"
            onClick={() => {
              setIsPlaying(true);
            }}
          >
            {pauseOverlay}
          </div>
        )}
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
              paused={!isPlaying}
              playbackId={playbackId}
              poster={posterSrc}
              ref={undefined}
              streamType={"on-demand"}
              style={
                {
                  "--fullscreen-button": "none",
                  "--pip-button": "none",
                } as CSSProperties
              }
              tokens={playbackTokens}
              onChapterChange={({ detail }) => {
                if (chapters && onChapterChange) {
                  onChapterChange(
                    chapters.find(
                      (chapter) => chapter.startTime === detail.startTime,
                    ) || null,
                  );
                }
              }}
              onCuePointChange={({ detail }) => {
                if (cuePoints && onCuePointChange) {
                  onCuePointChange(
                    cuePoints.find(
                      (cuePoint) => cuePoint.startTime === detail.time,
                    ) || null,
                  );
                }
              }}
              onLoadedMetadata={({ target }) => {
                if (!target) {
                  console.log("No target supplied on metadata loaded");
                  return;
                }
                const playerEl = target as MuxPlayerElement;
                void addChaptersAndCuePointsToPlayer(playerEl);
              }}
              onPause={(e) => {
                onPlayToggle?.({
                  type: "pause",
                  currentTime: hasProperty(e.target, "currentTime")
                    ? (e.target.currentTime as number)
                    : -1,
                });
                setIsPlaying(false);
              }}
              onPlay={(e) => {
                onPlayToggle?.({
                  type: "play",
                  currentTime: hasProperty(e.target, "currentTime")
                    ? (e.target.currentTime as number)
                    : -1,
                });
                setIsPlaying(true);
              }}
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
}
