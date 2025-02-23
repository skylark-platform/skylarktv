import { ReactNode, useState } from "react";
import clsx from "clsx";
import { PlayerTimecodeEvent } from "./playerTimecodeEvent";
import { Maybe, TimecodeEventType, TimecodeEventWithType } from "../types";
import { Dropdown } from "./generic/dropdown";
import { PlayerChapter, PlayerCuePoint } from "./generic/player";

interface PlayerPauseOverlayProps {
  timestamp: number;
  chapter: PlayerChapter<TimecodeEventWithType> | null;
}

const Section = ({ children }: { children: ReactNode }) => (
  <div className="relative h-[90%] w-full overflow-x-hidden overflow-y-hidden px-2 lg:px-4">
    {children}
  </div>
);

const SectionHeader = ({ children }: { children: ReactNode }) => (
  <div className="">{children}</div>
);

const Tips = ({ tips }: { tips: PlayerCuePoint<TimecodeEventWithType>[] }) => {
  const firstTitle = tips.find(({ payload }) => Boolean(payload.title))?.payload
    .title as string;
  const [selected, setSelected] = useState(firstTitle);

  const options = tips
    .map(({ payload }) => payload.title as Maybe<string>)
    .filter((title): title is string =>
      Boolean(title && typeof title === "string"),
    );

  const tip = selected && tips.find((t) => t.payload.title === selected);

  return (
    <Section>
      {(tips || options.length > 1) && (
        <SectionHeader>
          {tips && (
            <p className="mb-6 ml-2 w-full text-lg font-medium text-white">{`Tips`}</p>
          )}
          {options?.length > 1 && (
            <div className="max-w-96 px-2">
              <Dropdown
                items={options}
                label={options[0]}
                onChange={(u) => setSelected(u || firstTitle)}
              />
            </div>
          )}
        </SectionHeader>
      )}
      {tip && (
        <div
          className={clsx(
            "h-4/5 overflow-x-auto overflow-y-auto",
            options.length > 1 ? "my-2 py-2" : "-mt-6",
          )}
          key={tip.uid}
        >
          <PlayerTimecodeEvent payload={tip.payload} />
        </div>
      )}
    </Section>
  );
};

const Adverts = ({
  adverts,
}: {
  adverts: PlayerCuePoint<TimecodeEventWithType>[];
}) => (
  <Section>
    <SectionHeader>
      <p className="mb-4 ml-2 w-full text-lg font-medium text-white">
        {`In this scene`}
      </p>
    </SectionHeader>
    <div className="my-2 h-5/6 overflow-x-auto overflow-y-auto py-2">
      {adverts?.map((ad) => (
        <div className="mb-8" key={ad.payload.uid}>
          <PlayerTimecodeEvent payload={ad?.payload} />
        </div>
      ))}
    </div>
  </Section>
);

export const PlayerPauseOverlay = ({ chapter }: PlayerPauseOverlayProps) => {
  if (!chapter) {
    return <></>;
  }

  const tips = chapter?.cuePoints?.filter(
    (cp) => cp.payload.type === TimecodeEventType.Tips,
  );

  const adverts = chapter?.cuePoints?.filter((cp) =>
    cp.payload.type?.startsWith("AD"),
  );

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center overflow-hidden bg-black bg-opacity-75 p-8"
      key={chapter.uid}
    >
      <p className="w-full px-6 pt-4 text-left text-xl font-medium text-white lg:pt-8">
        {chapter?.title || ""}
      </p>
      <div className="mb-4 grid h-full max-h-full w-full grid-cols-2 items-center justify-center overflow-hidden">
        {tips && tips.length > 0 && <Tips tips={tips} />}
        {adverts && adverts.length > 0 && <Adverts adverts={adverts} />}
      </div>
    </div>
  );
};
