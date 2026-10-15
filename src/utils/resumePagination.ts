export interface PaginationCandidate {
  id: string;
  top: number;
  height: number;
  continuationHeight?: number;
  continuationTitle?: string;
}

export interface PaginationBreak {
  space: number;
  continuationTitle?: string;
}

export type PaginationBreakMap = Record<string, PaginationBreak>;

export interface PaginationLayout {
  breaks: PaginationBreakMap;
  contentHeight: number;
  pageCount: number;
}

export const shouldKeepSectionTogether = (
  sectionHeight: number,
  remainingHeight: number,
  usablePageHeight: number
): boolean => sectionHeight <= remainingHeight || sectionHeight <= usablePageHeight * .45;

export const calculatePaginationLayout = (
  flows: PaginationCandidate[][],
  pageHeight: number,
  paddingTop: number,
  paddingBottom: number
): PaginationLayout => {
  const usableHeight = Math.max(1, pageHeight - paddingTop - paddingBottom);
  const breaks: PaginationBreakMap = {};
  let contentHeight = pageHeight;

  flows.forEach((flow) => {
    let addedHeight = 0;
    let flowBottom = 0;

    [...flow].sort((a, b) => a.top - b.top).forEach((candidate) => {
      let virtualTop = candidate.top + addedHeight;
      const pageIndex = Math.max(0, Math.floor(virtualTop / pageHeight));
      const pageBottom = (pageIndex + 1) * pageHeight - paddingBottom;

      if (candidate.height <= usableHeight && virtualTop + candidate.height > pageBottom + 0.5) {
        const nextPageTop = (pageIndex + 1) * pageHeight + paddingTop;
        const space = Math.max(0, nextPageTop - virtualTop);
        const continuationHeight = candidate.continuationHeight ?? 0;
        breaks[candidate.id] = {
          space,
          continuationTitle: candidate.continuationTitle,
        };
        addedHeight += space + continuationHeight;
        virtualTop += space + continuationHeight;
      }

      flowBottom = Math.max(flowBottom, virtualTop + candidate.height);
    });

    contentHeight = Math.max(contentHeight, flowBottom + paddingBottom);
  });

  const pageCount = Math.max(1, Math.ceil((contentHeight - 1) / pageHeight));
  return { breaks, contentHeight, pageCount };
};
