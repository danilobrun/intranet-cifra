import styled, { css, keyframes } from "styled-components";
import {
  ActionsBar,
  FieldsGrid,
  FormSection,
  PortalList,
  RoleForm,
} from "./styles";

const portalSkeletonRows = Array.from({ length: 6 });

export function RoleFormSkeleton() {
  return (
    <SkeletonForm
      as="div"
      aria-busy="true"
      aria-label="Carregando formulario de role"
    >
      <FormSection>
        <SkeletonHeader>
          <SkeletonLine $width="130px" $height="18px" />
          <SkeletonLine $width="430px" />
        </SkeletonHeader>

        <FieldsGrid>
          <SkeletonField>
            <SkeletonLine $width="150px" $height="14px" />
            <SkeletonInput />
          </SkeletonField>

          <SkeletonField>
            <SkeletonLine $width="54px" $height="14px" />
            <SkeletonInput />
          </SkeletonField>
        </FieldsGrid>
      </FormSection>

      <FormSection>
        <SkeletonHeader>
          <SkeletonLine $width="150px" $height="18px" />
          <SkeletonLine $width="390px" />
        </SkeletonHeader>

        <SkeletonSelectorHeader>
          <SkeletonSearch />
          <SkeletonSelectorActions>
            <SkeletonPill $width="120px" />
            <SkeletonPill $width="98px" />
            <SkeletonPill $width="64px" />
          </SkeletonSelectorActions>
        </SkeletonSelectorHeader>

        <PortalList>
          {portalSkeletonRows.map((_, index) => (
            <SkeletonPortalItem key={index}>
              <SkeletonCheck />
              <SkeletonPortalText>
                <SkeletonLine $width="58%" $height="14px" />
                <SkeletonLine $width="92%" />
                <SkeletonLine $width="70%" />
              </SkeletonPortalText>
            </SkeletonPortalItem>
          ))}
        </PortalList>
      </FormSection>

      <SkeletonActions>
        <SkeletonButton $width="96px" />
        <SkeletonButton $width="148px" $primary />
      </SkeletonActions>
    </SkeletonForm>
  );
}

const shimmer = keyframes`
  0% {
    background-position: 120% 0;
  }

  100% {
    background-position: -120% 0;
  }
`;

const skeletonSurface = css`
  background: linear-gradient(
    90deg,
    oklch(93% 0.006 245) 0%,
    oklch(97% 0.004 245) 48%,
    oklch(93% 0.006 245) 100%
  );
  background-size: 220% 100%;
  animation: ${shimmer} 1.25s ease-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const SkeletonForm = styled(RoleForm)`
  pointer-events: none;
`;

const SkeletonHeader = styled.div`
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
`;

const SkeletonField = styled.div`
  display: grid;
  gap: 8px;
`;

const SkeletonLine = styled.span`
  ${skeletonSurface}
  display: block;
  width: ${({ $width }) => $width || "100%"};
  max-width: 100%;
  height: ${({ $height }) => $height || "12px"};
  border-radius: 999px;
`;

const SkeletonInput = styled.span`
  ${skeletonSurface}
  display: block;
  width: 100%;
  min-height: 50px;
  border-radius: 10px;
`;

const SkeletonSelectorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const SkeletonSearch = styled.span`
  ${skeletonSurface}
  display: block;
  width: min(360px, 100%);
  min-height: 40px;
  border-radius: 10px;
`;

const SkeletonSelectorActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
`;

const SkeletonPill = styled.span`
  ${skeletonSurface}
  display: block;
  width: ${({ $width }) => $width || "90px"};
  height: 36px;
  border-radius: 999px;
`;

const SkeletonPortalItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-height: 86px;
  padding: 14px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
`;

const SkeletonCheck = styled.span`
  ${skeletonSurface}
  width: 18px;
  min-width: 18px;
  height: 18px;
  margin-top: 2px;
  border-radius: 5px;
`;

const SkeletonPortalText = styled.div`
  display: grid;
  flex: 1;
  gap: 8px;
  min-width: 0;
`;

const SkeletonActions = styled(ActionsBar)`
  position: static;
`;

const SkeletonButton = styled.span`
  ${skeletonSurface}
  display: block;
  width: ${({ $width }) => $width || "120px"};
  min-height: 46px;
  border-radius: 10px;

  ${({ $primary }) =>
    $primary &&
    css`
      background: linear-gradient(
        90deg,
        oklch(74% 0.055 253) 0%,
        oklch(82% 0.04 253) 48%,
        oklch(74% 0.055 253) 100%
      );
      background-size: 220% 100%;
    `}

  @media (max-width: 575.98px) {
    width: 100%;
  }
`;
