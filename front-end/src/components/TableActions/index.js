import styled from "styled-components";

export const TableActionCell = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export const TableIconAction = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 9px;
  background: oklch(99% 0.004 245);
  color: ${({ $variant }) =>
    $variant === "danger" ? "oklch(50% 0.18 25)" : "oklch(38% 0.018 245)"};
  text-decoration: none;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;

  &:hover,
  &:focus {
    border-color: ${({ $variant }) =>
      $variant === "danger" ? "oklch(76% 0.11 25)" : "oklch(78% 0.018 245)"};
    background: ${({ $variant }) =>
      $variant === "danger" ? "oklch(96% 0.018 25)" : "oklch(96% 0.006 245)"};
    color: ${({ $variant }) =>
      $variant === "danger" ? "oklch(45% 0.18 25)" : "oklch(22% 0.018 245)"};
    outline: none;
    text-decoration: none;
  }

  &:focus-visible {
    border-color: oklch(55% 0.17 253);
    box-shadow: 0 0 0 0.2rem oklch(55% 0.17 253 / 0.14);
  }
`;
