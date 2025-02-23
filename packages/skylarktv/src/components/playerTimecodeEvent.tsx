import clsx from "clsx";
import { Whisk } from "./shoppable/whisk";
import { TimecodeEventType, TimecodeEventWithType } from "../types";
import { ParseAndDisplayHTML } from "./generic/parseAndDisplayHtml";
import { Button } from "./generic/button";

interface PlayerTimecodeEventProps {
  payload?: TimecodeEventWithType;
}

export const PlayerTimecodeEvent = ({ payload }: PlayerTimecodeEventProps) => {
  if (!payload) {
    return <></>;
  }

  const image = payload.images?.objects?.[0];

  return (
    <div
      className={clsx(
        "mx-2 flex-grow rounded-sm text-white",
        [
          TimecodeEventType.Advertcontextual,
          TimecodeEventType.Advertlink,
        ].includes(payload.type) && "h-32",
        payload.type === TimecodeEventType.Whisk && "md:h-32",
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {payload.type === TimecodeEventType.Tips && (
        <>
          <ParseAndDisplayHTML fallbackMessage="" html={payload.copy || null} />
        </>
      )}
      {payload.type === TimecodeEventType.Whisk && (
        <>
          <Whisk
            recipeUrl={payload.link_href as string}
            title={payload.title || undefined}
            uid={payload.uid}
          />
        </>
      )}
      {payload.type === TimecodeEventType.Advertlink && payload.link_href && (
        <>
          <a
            className="flex h-full flex-row items-center opacity-90 hover:opacity-100"
            href={payload.link_href as string}
            rel="noreferrer"
            target="_blank"
          >
            {image && image.url && (
              // <div
              //   className="block h-full w-32 flex-grow"
              //   style={{ backgroundImage: `url(${image.url})` }}
              // >
              //   </div>
              // {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={image.alt_text || `alt for ${image.url}`}
                className="mr-6 block h-full object-contain"
                src={image.url}
              />
            )}
            {/* <p className="text-sm md:text-base">{payload.link_text}</p> */}
            <div className="flex flex-col space-y-3">
              <ParseAndDisplayHTML
                className="-mt-2"
                fallbackMessage=""
                html={payload.copy || null}
                variant="tight"
              />
              <Button text={payload.link_text as string} variant="secondary" />
            </div>
          </a>
        </>
      )}
    </div>
  );
};
