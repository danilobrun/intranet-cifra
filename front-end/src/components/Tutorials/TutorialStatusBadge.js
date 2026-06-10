import styled from "styled-components";

const statusConfig = {
  rascunho: {
    label: "Rascunho",
    $variant: "draft",
  },
  publicado: {
    label: "Publicado",
    $variant: "published",
  },
  arquivado: {
    label: "Arquivado",
    $variant: "archived",
  },
};

export function TutorialStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.rascunho;

  return <Badge $variant={config.$variant}>{config.label}</Badge>;
}

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border: 1px solid
    ${({ $variant }) => {
      if ($variant === "published") {
        return "oklch(78% 0.105 154)";
      }

      if ($variant === "archived") {
        return "oklch(82% 0.012 245)";
      }

      return "oklch(83% 0.14 85)";
    }};
  border-radius: 999px;
  background: ${({ $variant }) => {
    if ($variant === "published") {
      return "oklch(96% 0.035 154)";
    }

    if ($variant === "archived") {
      return "oklch(95.5% 0.006 245)";
    }

    return "oklch(96% 0.07 85)";
  }};
  color: ${({ $variant }) => {
    if ($variant === "published") {
      return "oklch(38% 0.105 154)";
    }

    if ($variant === "archived") {
      return "oklch(40% 0.014 245)";
    }

    return "oklch(39% 0.11 80)";
  }};
  font-size: 0.78rem;
  font-weight: 760;
  line-height: 1;
  white-space: nowrap;
`;
