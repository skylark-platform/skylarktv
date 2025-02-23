import { useEffect } from "react";
import { hasProperty } from "../../lib/utils";

interface WhiskProps {
  uid: string;
  recipeUrl: string;
  title?: string;
}

export const Whisk = ({ uid, recipeUrl }: WhiskProps) => {
  const whiskId = `whisk-${uid}`;

  const whisk =
    typeof window !== "undefined" && hasProperty(global, "whisk")
      ? (global.whisk as {
          queue: unknown[];
          display: (id: string) => void;
          shoppingList: {
            defineWidget: (id: string, opts: object) => void;
          };
          config: {
            set: (s: string, o: object) => void;
          };
        })
      : null;

  const triggerWhiskWidget = () => {
    if (whisk) {
      whisk.queue = whisk.queue || [];

      whisk.config.set("shoppingList", {
        recipeUrl,
      });

      whisk.queue.push(() => {
        whisk.shoppingList.defineWidget(whiskId, {
          styles: {
            type: "save-recipe",
            size: "large",
          },
        });
      });

      whisk.queue.push(() => {
        whisk?.display(whiskId);
      });
    }
  };

  useEffect(() => {
    if (whisk) {
      triggerWhiskWidget();
    }
  }, [whisk, recipeUrl]);

  return (
    <div className="w-full" key={recipeUrl}>
      {/* {title && <p className="mb-1">{title}</p>} */}
      <div
        className="rounded bg-white p-2"
        data-whiskid={recipeUrl}
        id={whiskId}
      ></div>
    </div>
  );
};
