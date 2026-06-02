import { Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";

export const RoleForm = styled(Form)`
  display: grid;
  gap: 22px;
  padding-bottom: 32px;
`;

export const FormSection = styled.section`
  padding: 22px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 12px;
  background: oklch(99% 0.004 245);
  box-shadow: 0 10px 24px oklch(22% 0.018 245 / 0.06);

  @media (max-width: 575.98px) {
    padding: 18px;
    border-radius: 10px;
  }
`;

export const SectionHeader = styled.div`
  margin-bottom: 20px;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  color: oklch(22% 0.018 245);
  font-size: 1.08rem;
  font-weight: 760;
  line-height: 1.25;
`;

export const SectionDescription = styled.p`
  margin: 6px 0 0;
  color: oklch(49% 0.018 245);
  font-size: 0.93rem;
  line-height: 1.45;
`;

export const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(140px, 220px);
  gap: 18px 20px;

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr;
  }
`;

export const FieldGroup = styled(Form.Group)`
  display: grid;
  gap: 8px;
  max-width: ${({ $compact }) => ($compact ? "220px" : "none")};

  @media (max-width: 767.98px) {
    max-width: none;
  }
`;

export const FieldLabel = styled(Form.Label)`
  margin: 0;
  color: oklch(28% 0.016 245);
  font-size: 0.92rem;
  font-weight: 700;
`;

export const FieldControl = styled(Form.Control)`
  min-height: 50px;
  padding: 0 14px;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 10px;
  background-color: oklch(99% 0.004 240);
  color: oklch(22% 0.018 245);
  font-size: 0.98rem;
  line-height: 1.45;
  box-shadow: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;

  &::placeholder {
    color: oklch(58% 0.018 245);
  }

  &:focus {
    border-color: oklch(55% 0.17 253);
    background-color: oklch(99.2% 0.004 240);
    box-shadow: 0 0 0 0.22rem oklch(55% 0.17 253 / 0.14);
  }
`;

export const SelectorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

export const SelectorSearch = styled.div`
  position: relative;
  width: min(360px, 100%);

  input {
    width: 100%;
    min-height: 40px;
    padding: 9px 16px 9px 42px;
    border: 1px solid oklch(87% 0.014 245);
    border-radius: 10px;
    background: oklch(99% 0.004 240);
    color: oklch(22% 0.018 245);
    outline: none;
    transition:
      border-color 160ms ease,
      box-shadow 160ms ease;

    &::placeholder {
      color: oklch(58% 0.018 245);
    }

    &:focus {
      border-color: oklch(55% 0.17 253);
      box-shadow: 0 0 0 0.2rem oklch(55% 0.17 253 / 0.12);
    }
  }
`;

export const SelectorSearchIcon = styled(FontAwesomeIcon)`
  position: absolute;
  top: 50%;
  left: 16px;
  color: oklch(49% 0.018 245);
  font-size: 0.9rem;
  pointer-events: none;
  transform: translateY(-50%);
`;

export const SelectorActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
`;

export const SelectorCounter = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid oklch(86% 0.028 253);
  border-radius: 999px;
  background: oklch(97% 0.018 253);
  color: oklch(39% 0.12 253);
  font-size: 0.88rem;
  font-weight: 700;
  white-space: nowrap;
`;

export const SelectorButton = styled.button`
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 8px;
  background: oklch(99% 0.004 245);
  color: oklch(31% 0.018 245);
  font-size: 0.9rem;
  font-weight: 700;

  &:hover,
  &:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    outline: none;
  }
`;

export const PortalList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
`;

export const PortalItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-height: 86px;
  padding: 14px;
  border: 1px solid
    ${({ $selected }) =>
      $selected ? "oklch(78% 0.07 253)" : "oklch(89% 0.009 245)"};
  border-radius: 10px;
  background: ${({ $selected }) =>
    $selected ? "oklch(97% 0.02 253)" : "oklch(99% 0.004 245)"};
  transition:
    border-color 160ms ease,
    background-color 160ms ease;

  input {
    width: 18px;
    min-width: 18px;
    height: 18px;
    margin-top: 2px;
    accent-color: oklch(54% 0.19 253);
  }
`;

export const PortalText = styled.label`
  display: grid;
  gap: 5px;
  min-width: 0;
  cursor: pointer;
`;

export const PortalName = styled.span`
  color: oklch(22% 0.018 245);
  font-size: 0.96rem;
  font-weight: 760;
  line-height: 1.3;
`;

export const PortalDescription = styled.span`
  color: oklch(49% 0.018 245);
  font-size: 0.9rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const EmptyState = styled.div`
  grid-column: 1 / -1;
  padding: 18px;
  border: 1px dashed oklch(84% 0.014 245);
  border-radius: 10px;
  color: oklch(49% 0.018 245);
  text-align: center;
`;

export const ActionsBar = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 2;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0 0;
  background: linear-gradient(
    180deg,
    oklch(98.5% 0.004 245 / 0),
    oklch(98.5% 0.004 245) 38%
  );

  @media (max-width: 575.98px) {
    flex-direction: column-reverse;
  }
`;

export const SecondaryAction = styled(Button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 20px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 10px;
  color: oklch(31% 0.018 245);
  background: oklch(99% 0.004 245);
  font-weight: 700;
  text-decoration: none;

  &:hover,
  &:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
    text-decoration: none;
  }
`;

export const PrimaryAction = styled(Button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 0 22px;
  border: 0;
  border-radius: 10px;
  background-color: oklch(54% 0.19 253);
  color: oklch(98% 0.004 240);
  font-weight: 760;

  &:hover,
  &:focus {
    background-color: oklch(48% 0.2 253);
    box-shadow: 0 12px 24px oklch(42% 0.18 253 / 0.24);
  }

  &:disabled {
    background-color: oklch(68% 0.06 250);
    box-shadow: none;
  }
`;
