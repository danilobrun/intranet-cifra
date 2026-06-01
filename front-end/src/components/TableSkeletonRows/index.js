import styled, { css, keyframes } from "styled-components";

const WIDTH_PATTERN = ["72%", "84%", "64%", "76%", "58%", "68%"];

const getSkeletonWidth = (rowIndex, columnIndex) => {
  const patternIndex = (rowIndex + columnIndex) % WIDTH_PATTERN.length;
  return WIDTH_PATTERN[patternIndex];
};

export function TableSkeletonRows({
  columns,
  rows = 4,
  actionColumnIndex = columns - 1,
}) {
  return Array.from({ length: rows }, (_, rowIndex) => (
    <tr key={`loading-row-${rowIndex}`} aria-hidden="true">
      {Array.from({ length: columns }, (_, columnIndex) => (
        <td key={`loading-cell-${rowIndex}-${columnIndex}`}>
          {columnIndex === actionColumnIndex ? (
            <SkeletonActions>
              <SkeletonPill />
              <SkeletonPill $short />
            </SkeletonActions>
          ) : (
            <SkeletonLine
              $width={getSkeletonWidth(rowIndex, columnIndex)}
            />
          )}
        </td>
      ))}
    </tr>
  ));
}

const shimmer = keyframes`
  0% {
    background-position: 100% 0;
  }

  100% {
    background-position: -100% 0;
  }
`;

const skeletonSurface = css`
  background:
    linear-gradient(
      90deg,
      oklch(93% 0.006 245) 0%,
      oklch(97% 0.004 245) 45%,
      oklch(93% 0.006 245) 90%
    );
  background-size: 220% 100%;
  animation: ${shimmer} 1.25s ease-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const SkeletonLine = styled.span`
  display: block;
  width: ${({ $width }) => $width};
  max-width: 100%;
  height: 14px;
  border-radius: 999px;
  ${skeletonSurface}
`;

const SkeletonActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const SkeletonPill = styled.span`
  display: block;
  width: ${({ $short }) => ($short ? "62px" : "72px")};
  height: 31px;
  border-radius: 6px;
  ${skeletonSurface}
`;
