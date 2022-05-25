import React from "react";

interface MetadataPanelProps {
  content: {
    icon: JSX.Element;
    header: string;
    body: string | string[];
  }[];
}

export const MetadataPanel: React.FC<MetadataPanelProps> = ({ content }) => (
  <div className="w-full text-xs text-white md:text-base">
    {content.map(({ body, header, icon }) => (
      <div
        className="grid w-full grid-cols-8 py-2 md:gap-4 md:py-4 lg:grid-cols-10"
        key={header}
      >
        <div className="col-span-1 mt-2 flex justify-center sm:text-lg md:justify-end md:text-xl">
          {icon}
        </div>
        <div className="col-span-2 flex w-full justify-center">{header}</div>
        <div className="col-span-5 justify-start text-gray-400 lg:col-span-7">
          {body && Array.isArray(body) ? body.join(", ") : body}
        </div>
      </div>
    ))}
  </div>
);

export default MetadataPanel;
