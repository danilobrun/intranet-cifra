import { Button, Form } from "react-bootstrap";
import styled from "styled-components";

export const UserForm = styled(Form)`
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 20px;

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr;
  }
`;

export const FieldGroup = styled(Form.Group)`
  display: grid;
  gap: 8px;
  grid-column: ${({ $full }) => ($full ? "1 / -1" : "auto")};
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

export const FieldHint = styled(Form.Text)`
  color: oklch(49% 0.018 245);
  font-size: 0.86rem;
`;

export const PasswordField = styled.div`
  position: relative;

  ${FieldControl} {
    padding-right: 48px;
  }
`;

export const PasswordToggle = styled.button`
  position: absolute;
  top: 50%;
  right: 12px;
  width: 32px;
  height: 32px;
  display: inline-grid;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: oklch(45% 0.018 245);
  transform: translateY(-50%);
  transition:
    background-color 160ms ease,
    color 160ms ease;

  &:hover,
  &:focus {
    background-color: oklch(94% 0.012 245);
    color: oklch(34% 0.04 253);
    outline: none;
  }

  &:disabled {
    cursor: not-allowed;
    color: oklch(62% 0.012 245);
  }
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
