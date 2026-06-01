import styled, { css, keyframes } from "styled-components";
import { TableSkeletonRows } from "../../components/TableSkeletonRows";
import {
  IntroSection,
  PortalTable,
  SectionHeader,
  TableCard,
  TableScroll,
} from "./styles";

const DETAIL_COLUMNS = 4;

export function PortalDetailSkeleton() {
  return (
    <>
      <IntroSection aria-busy="true" aria-label="Carregando detalhes do portal">
        <TitleSkeleton />
        <DescriptionSkeleton>
          <SkeletonLine $width="92%" />
          <SkeletonLine $width="76%" />
        </DescriptionSkeleton>
      </IntroSection>

      <SectionHeader aria-hidden="true">
        <IconSkeleton />
        <SectionTitleSkeleton />
      </SectionHeader>

      <TableCard>
        <TableScroll>
          <PortalTable aria-busy="true">
            <thead>
              <tr>
                {Array.from({ length: DETAIL_COLUMNS }, (_, index) => (
                  <th key={`detail-loading-header-${index}`}>
                    <HeaderSkeleton $width={index === 1 ? "42px" : "96px"} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <TableSkeletonRows
                columns={DETAIL_COLUMNS}
                rows={4}
                actionColumnIndex={null}
              />
            </tbody>
          </PortalTable>
        </TableScroll>
      </TableCard>
    </>
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

const TitleSkeleton = styled.span`
  display: block;
  width: min(460px, 72%);
  height: 42px;
  margin: 0 auto;
  border-radius: 999px;
  ${skeletonSurface}

  @media (max-width: 575.98px) {
    height: 34px;
  }
`;

const DescriptionSkeleton = styled.div`
  display: grid;
  justify-items: center;
  gap: 10px;
  max-width: 900px;
  margin: 18px auto 0;
`;

const SkeletonLine = styled.span`
  display: block;
  width: ${({ $width }) => $width || "100%"};
  max-width: 100%;
  height: 14px;
  border-radius: 999px;
  ${skeletonSurface}
`;

const IconSkeleton = styled.span`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  ${skeletonSurface}
`;

const SectionTitleSkeleton = styled.span`
  display: block;
  width: 156px;
  height: 22px;
  border-radius: 999px;
  ${skeletonSurface}
`;

const HeaderSkeleton = styled.span`
  display: block;
  width: ${({ $width }) => $width || "96px"};
  height: 14px;
  border-radius: 999px;
  background: oklch(96% 0.006 245 / 0.72);
`;
