import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import dayjs from "dayjs";
import { FiExternalLink } from "react-icons/fi";
import clsx from "clsx";
import { DimensionContent } from "./dimension-content";
import { DimensionToggle } from "./dimension-toggle";
import { DimensionRadioButton } from "./dimension-radio-button";
import { SkylarkBranding } from "../skylark-branding";
import { useDimensions } from "../../../contexts";
import { ConnectToSkylarkModal } from "../connect-to-skylark-modal";
import { DimensionKey } from "../../../lib/interfaces";
import { CLIENT_APP_CONFIG, LOCAL_STORAGE } from "../../../constants/app";
import { SAAS_API_ENDPOINT, SAAS_API_KEY } from "../../../constants/env";
import { CLIENT_NAVIGATION_CONFIG } from "../../../constants/navigation";

const generateSkylarkAutoconnectUrl = () => {
  const isBrowser = typeof window !== "undefined";
  const url =
    (isBrowser && window.localStorage.getItem(LOCAL_STORAGE.uri)) ||
    SAAS_API_ENDPOINT;
  const apikey =
    (isBrowser && window.localStorage.getItem(LOCAL_STORAGE.apikey)) ||
    SAAS_API_KEY;
  return `https://app.skylarkplatform.com/beta/connect?uri=${url}&apikey=${apikey}`;
};

interface DimensionSettingsProps {
  show?: boolean;
  skylarkApiUrl?: string;
  timeTravelEnabled?: boolean;
  children?: React.ReactNode;
  onCachePurge?: () => void;
}

const variants = {
  hidden: { opacity: 0, y: "90%" },
  animate: { opacity: 1, y: 0 },
};

const { mobileVariant } = CLIENT_NAVIGATION_CONFIG;

export const DimensionSettings: React.FC<DimensionSettingsProps> = ({
  show: propShow = false,
  timeTravelEnabled,
  skylarkApiUrl,
  onCachePurge,
}) => {
  const [show, setShow] = useState(propShow);
  const { dimensions, setProperty, setTimeTravel, setLanguage, setRegion } =
    useDimensions();

  const nextWeek = dayjs().add(7, "days");
  const nextWeekReadable = nextWeek.format("DD MMMM, h:mm A");
  const nextWeekIso = nextWeek.toISOString();

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        className={clsx(
          `fixed right-lg-gutter z-20 flex transition-opacity duration-500 md:bottom-0 xl:right-xl-gutter`,
          mobileVariant === "bar" ? "bottom-14" : "bottom-0",
          show ? "opacity-0" : "opacity-100",
        )}
      >
        <DimensionToggle variant="open" onClick={() => setShow(true)} />
      </div>
      <AnimatePresence>
        {show && (
          <motion.div
            animate="animate"
            className={clsx(
              `fixed left-0 right-0 z-50 block h-[60vh] bg-white font-skylark-branding md:bottom-0 md:h-auto`,
              mobileVariant === "bar" ? "bottom-14" : "bottom-0",
            )}
            dir="ltr"
            exit="hidden"
            initial="hidden"
            key="dimension-settings"
            transition={{ type: "spring", bounce: 0.2 }}
            variants={variants}
            // For debug dimensions
            {...Object.entries(dimensions).reduce(
              (prev, [dimension, value]) => ({
                ...prev,
                [`data-dimension-${dimension.toLowerCase()}`]: value,
              }),
              {} as Record<string, string>,
            )}
          >
            <div className="absolute -top-9 right-lg-gutter flex xl:right-xl-gutter">
              <DimensionToggle variant="close" onClick={() => setShow(false)} />
            </div>
            <div className="relative h-full overflow-y-auto px-sm-gutter py-4 md:px-md-gutter md:py-12 lg:px-lg-gutter xl:px-xl-gutter">
              <div className="mb-4 flex items-center justify-between">
                <div className="group flex items-center">
                  <SkylarkBranding className="w-12 md:w-48" />
                  <div className="invisible flex items-center justify-between space-x-4 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-hover:delay-1000">
                    <a
                      className="ml-4 text-gray-400 hover:text-blue-600"
                      href={generateSkylarkAutoconnectUrl()}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <FiExternalLink />
                    </a>
                    {onCachePurge && (
                      <button
                        className="rounded-full text-sm font-medium text-gray-400 hover:text-blue-600"
                        onClick={onCachePurge}
                      >
                        {"Purge cache?"}
                      </button>
                    )}
                  </div>
                </div>
                <div className="ml-2 flex flex-col items-start justify-end text-sm md:flex-row md:items-center">
                  <p className="hidden text-gray-400 md:block">{`Get in touch:`}</p>
                  <a
                    className="text-skylark-blue md:pl-1"
                    href={
                      "mailto:hello@skylarkplatform.com?subject=Enquiry from SkylarkTV"
                    }
                    rel="noreferrer"
                    target="_blank"
                  >
                    {"hello@skylarkplatform.com"}
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-start">
                <p className="text-sm font-medium">
                  {skylarkApiUrl
                    ? `Connected: ${
                        skylarkApiUrl.includes("skylarkplatform.io") ||
                        skylarkApiUrl.includes("skylarkplatform.com")
                          ? skylarkApiUrl.split(".")[1]
                          : skylarkApiUrl
                      }.`
                    : "Not connected."}
                </p>
                <button
                  className="ml-1.5 rounded-full text-sm font-medium text-skylark-blue hover:text-blue-600"
                  onClick={() => setModalOpen(true)}
                >
                  {"Change"}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-8 pt-5 md:grid-cols-2 md:pt-8 lg:grid-cols-4">
                <DimensionContent label="Customer Type">
                  <DimensionRadioButton
                    active={dimensions[DimensionKey.Property]}
                    options={
                      CLIENT_APP_CONFIG.dimensions[DimensionKey.Property].values
                    }
                    onChange={(value: string) => setProperty(value)}
                  />
                </DimensionContent>
                <DimensionContent label="Region">
                  <DimensionRadioButton
                    active={dimensions[DimensionKey.Region]}
                    options={
                      CLIENT_APP_CONFIG.dimensions[DimensionKey.Region].values
                    }
                    onChange={(value: string) => {
                      setRegion(value);
                      if (
                        (value === "europe" &&
                          !["en-gb", "pt-pt"].includes(
                            dimensions[DimensionKey.Language],
                          )) ||
                        (value === "mena" &&
                          !["en-gb", "ar"].includes(
                            dimensions[DimensionKey.Language],
                          ))
                      ) {
                        setLanguage("en-gb");
                      }
                    }}
                  />
                </DimensionContent>
                <DimensionContent label="Language">
                  <DimensionRadioButton
                    active={dimensions[DimensionKey.Language]}
                    options={
                      dimensions.region === "mena"
                        ? [
                            { text: "English", value: "en-gb" },
                            { text: "Arabic (RTL)", value: "ar" },
                          ]
                        : [
                            { text: "English", value: "en-gb" },
                            { text: "Portuguese", value: "pt-pt" },
                          ]
                    }
                    onChange={(value) => setLanguage(value)}
                  />
                </DimensionContent>
                {timeTravelEnabled && (
                  <DimensionContent label="Time Travel">
                    <DimensionRadioButton
                      active={dimensions[DimensionKey.TimeTravel]}
                      labelClassName="chromatic-ignore"
                      options={[
                        { text: "Now", value: "" },
                        {
                          text: `Forward 7 days (${nextWeekReadable})`,
                          value: nextWeekIso,
                          activeOverride:
                            dimensions[DimensionKey.TimeTravel] !== "",
                        },
                      ]}
                      onChange={(value: string) => setTimeTravel(value)}
                    />
                  </DimensionContent>
                )}
              </div>
            </div>
          </motion.div>
        )}
        <ConnectToSkylarkModal
          closeModal={() => setModalOpen(false)}
          isOpen={modalOpen}
        />
      </AnimatePresence>
    </>
  );
};

export default DimensionSettings;
