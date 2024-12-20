import { motion } from "motion/react";
import React from "react";
import { useNumberOfThumbnailsByBreakpoint } from "../../../hooks/useNumberOfThumbnailsByBreakpoint";

interface SkeletonProps {
  show: boolean;
  children?: React.ReactNode;
}

const container = {
  exit: {
    opacity: 0,
  },
  show: { opacity: 1 },
};

const wrapper = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 1,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
  },
  show: { opacity: 1, transition: { duration: 1 } },
};

export const SkeletonPage: React.FC<SkeletonProps> = ({
  show = true,
  children,
}) => {
  const numPerRow = useNumberOfThumbnailsByBreakpoint(0);
  // 4 Rows of Skeleton max
  const arr = Array.from({ length: numPerRow * 4 }, (_, i) => i);
  return (
    <>
      {show && arr.length > 0 && (
        <motion.div
          animate="show"
          className="h-auto w-full px-sm-gutter md:px-md-gutter lg:px-lg-gutter xl:px-xl-gutter"
          exit="exit"
          initial=""
          variants={container}
        >
          <motion.div
            animate="show"
            className="flex-wrap"
            exit="hidden"
            initial="hidden"
            variants={wrapper}
          >
            {arr.map((_, index) => (
              <motion.div
                className="inline-block w-1/6 px-2 pb-4"
                key={`skeleton-${index}`}
                style={{ width: `${100 / numPerRow}%` }}
                variants={item}
              >
                <div className="aspect-h-9 aspect-w-16 animate-pulse rounded-sm bg-gray-700"></div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
      {!show && children && (
        <motion.div
          animate={{ opacity: 1 }}
          className="contents w-full"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
};
