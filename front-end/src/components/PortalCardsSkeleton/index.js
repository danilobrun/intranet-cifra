import { Col, Row } from "react-bootstrap";
import styled, { css, keyframes } from "styled-components";

export function PortalCardsSkeleton({ count = 8 }) {
  return (
    <Row
      className="g-3 g-lg-4"
      as="section"
      aria-label="Carregando portais"
    >
      {Array.from({ length: count }, (_, index) => (
        <Col key={`portal-skeleton-${index}`} xs={12} sm={6} lg={4} xl={3}>
          <SkeletonCard aria-hidden="true">
            <SkeletonImageArea>
              <SkeletonLogo />
            </SkeletonImageArea>
            <SkeletonBody>
              <SkeletonLine $width="68%" $height="18px" />
              <SkeletonTextGroup>
                <SkeletonLine $width="92%" />
                <SkeletonLine $width="78%" />
                <SkeletonLine $width="58%" />
              </SkeletonTextGroup>
              <SkeletonButton />
            </SkeletonBody>
          </SkeletonCard>
        </Col>
      ))}
    </Row>
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

const SkeletonCard = styled.article`
  height: 100%;
  overflow: hidden;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 0.5rem;
  background: oklch(99% 0.004 245);
  box-shadow: 0 12px 28px oklch(22% 0.018 245 / 0.08);
`;

const SkeletonImageArea = styled.div`
  display: grid;
  place-items: center;
  min-height: 9.5rem;
  padding: 1rem;
  border-bottom: 1px solid oklch(89% 0.009 245);
  background: oklch(97.6% 0.006 245);
`;

const SkeletonLogo = styled.span`
  width: min(68%, 10rem);
  height: 5.25rem;
  border-radius: 0.75rem;
  ${skeletonSurface}
`;

const SkeletonBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
  min-height: 12.5rem;
  padding: 1rem;
`;

const SkeletonTextGroup = styled.div`
  display: grid;
  gap: 0.55rem;
`;

const SkeletonLine = styled.span`
  display: block;
  width: ${({ $width }) => $width || "100%"};
  height: ${({ $height }) => $height || "13px"};
  border-radius: 999px;
  ${skeletonSurface}
`;

const SkeletonButton = styled.span`
  display: block;
  width: 100%;
  height: 44px;
  margin-top: auto;
  border-radius: 0.375rem;
  ${skeletonSurface}
`;
