import styled, { css, keyframes } from "styled-components";

export function WeatherPanelSkeleton() {
  return (
    <SkeletonContent aria-label="Carregando informações do clima">
      <MainSkeletonRow>
        <SkeletonIcon />
        <SkeletonInfo>
          <SkeletonLine $width="42%" $height="14px" />
          <SkeletonLine $width="28%" $height="54px" />
          <SkeletonLine $width="34%" $height="16px" />
        </SkeletonInfo>
      </MainSkeletonRow>

      <MetricSkeletonGrid>
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonMetric key={`weather-metric-skeleton-${index}`}>
            <SkeletonDot />
            <span>
              <SkeletonLine $width="72%" />
              <SkeletonLine $width="48%" $height="16px" />
            </span>
          </SkeletonMetric>
        ))}
      </MetricSkeletonGrid>

      <HourlySkeletonGrid>
        {Array.from({ length: 8 }, (_, index) => (
          <SkeletonHour key={`weather-hour-skeleton-${index}`}>
            <SkeletonLine $width="46%" />
            <SkeletonDot />
            <SkeletonLine $width="58%" $height="22px" />
            <SkeletonLine $width="82%" />
          </SkeletonHour>
        ))}
      </HourlySkeletonGrid>
    </SkeletonContent>
  );
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
      oklch(92% 0.006 245) 0%,
      oklch(97% 0.004 245) 45%,
      oklch(92% 0.006 245) 90%
    );
  background-size: 220% 100%;
  animation: ${shimmer} 1.25s ease-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const SkeletonContent = styled.div`
  display: grid;
  gap: 1.25rem;
`;

const MainSkeletonRow = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 1.25rem;
  align-items: center;

  @media (max-width: 575px) {
    grid-template-columns: 1fr;
  }
`;

const SkeletonIcon = styled.span`
  width: 6rem;
  height: 6rem;
  border-radius: 1rem;
  ${skeletonSurface}
`;

const SkeletonInfo = styled.div`
  display: grid;
  gap: 0.6rem;
`;

const SkeletonLine = styled.span`
  display: block;
  width: ${({ $width }) => $width || "100%"};
  height: ${({ $height }) => $height || "13px"};
  border-radius: 999px;
  ${skeletonSurface}
`;

const MetricSkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 991px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 575px) {
    grid-template-columns: 1fr;
  }
`;

const SkeletonMetric = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.75rem;
  padding: 0.85rem;
  border: 1px solid oklch(88% 0.01 245);
  border-radius: 0.5rem;
`;

const SkeletonDot = styled.span`
  width: 2rem;
  height: 2rem;
  border-radius: 0.45rem;
  ${skeletonSurface}
`;

const HourlySkeletonGrid = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(8.5rem, 1fr);
  gap: 0.6rem;
  overflow-x: hidden;
`;

const SkeletonHour = styled.div`
  display: grid;
  gap: 0.55rem;
  padding: 0.9rem;
  border: 1px solid oklch(88% 0.01 245);
  border-radius: 0.5rem;
`;
