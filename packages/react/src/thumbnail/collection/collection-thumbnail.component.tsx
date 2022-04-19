import React from "react";
import {
  BaseThumbnailWithLink,
  ThumbnailList,
  ThumbnailProps,
} from "../base/base-thumbnail.component";

export const CollectionThumbnail: React.FC<ThumbnailProps> = (props) => {
  const { title, subtitle, tags } = props;
  return (
    <BaseThumbnailWithLink large {...props} contentLocation="inside">
      <div className="flex h-full w-full justify-center items-center flex-col relative text-center">
        <h4 className="text-3xl">{title}</h4>
        {subtitle && <p className="text-3xl text-gray-400">{subtitle}</p>}
        {tags && (
          <div className="absolute bottom-0">
            <ThumbnailList contents={tags} />
          </div>
        )}
      </div>
    </BaseThumbnailWithLink>
  );
};
