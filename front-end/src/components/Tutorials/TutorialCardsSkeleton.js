import { Col, Row } from "react-bootstrap";
import styled, { css, keyframes } from "styled-components";

export function TutorialCardsSkeleton({ count = 6 }) {
  return (
    <Row
      className="g-3 g-lg-4"
      as="section"
      aria-label="Carregando tutoriais"
    >
      {Array.from({ length: count }, (_, index) => (
        <Col key={`tutorial-skeleton-${index}`} xs={12} md={6} xl={4}>
          <SkeletonCard aria-hidden="true">
            <SkeletonBody>
              <SkeletonHeader>
                <SkeletonPill $width="86px" />
                <SkeletonPill $width="58px" />
              </SkeletonHeader>
              <SkeletonLine $width="78%" $height="18px" />
              <SkeletonTextGroup>
                <SkeletonLine $width="94%" />
                <SkeletonLine $width="86%" />
                <SkeletonLine $width="62%" />
              </SkeletonTextGroup>
              <SkeletonMeta>
                <SkeletonLine $width="72px" />
                <SkeletonLine $width="152px" />
              </SkeletonMeta>
            </SkeletonBody>
            <SkeletonFooter>
              <SkeletonButton $width="120px" $primary />
              <SkeletonActions>
                <SkeletonButton $width="70px" />
                <SkeletonSquare />
              </SkeletonActions>
            </SkeletonFooter>
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
  border-radius: 12px;
  background: oklch(99% 0.004 245);
  box-shadow: 0 12px 28px oklch(22% 0.018 245 / 0.07);
`;

const SkeletonBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 226px;
  padding: 18px;
`;

const SkeletonHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const SkeletonTextGroup = styled.div`
  display: grid;
  gap: 9px;
`;

const SkeletonLine = styled.span`
  display: block;
  width: ${({ $width }) => $width || "100%"};
  max-width: 100%;
  height: ${({ $height }) => $height || "13px"};
  border-radius: 999px;
  ${skeletonSurface}
`;

const SkeletonPill = styled.span`
  display: block;
  width: ${({ $width }) => $width || "90px"};
  height: 24px;
  border-radius: 999px;
  ${skeletonSurface}
`;

const SkeletonMeta = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  flex-wrap: wrap;
`;

const SkeletonFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 18px;
  border-top: 1px solid oklch(91% 0.008 245);
  background: oklch(98% 0.004 245);
  flex-wrap: wrap;
`;

const SkeletonActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const SkeletonButton = styled.span`
  display: block;
  width: ${({ $width }) => $width || "100px"};
  height: 36px;
  border-radius: 9px;
  ${skeletonSurface}

  ${({ $primary }) =>
    $primary &&
    css`
      background:
        linear-gradient(
          90deg,
          oklch(74% 0.055 253) 0%,
          oklch(82% 0.04 253) 45%,
          oklch(74% 0.055 253) 90%
        );
      background-size: 220% 100%;
    `}
`;

const SkeletonSquare = styled.span`
  display: block;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  ${skeletonSurface}
`;
