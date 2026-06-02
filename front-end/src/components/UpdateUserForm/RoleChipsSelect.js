import { forwardRef } from "react";
import { Dropdown, Form } from "react-bootstrap";
import styled from "styled-components";

const getRoleLabel = (role) => {
  const cargo = String(role?.cargo || "").trim();

  return cargo || "Role sem identificacao";
};

const RoleSelectToggle = forwardRef(
  ({ children, onClick, disabled, title, ...props }, ref) => {
    return (
      <ToggleButton
        {...props}
        ref={ref}
        type="button"
        disabled={disabled}
        title={title}
        onClick={(event) => {
          event.preventDefault();

          if (!disabled) {
            onClick(event);
          }
        }}
      >
        {children}
      </ToggleButton>
    );
  },
);

RoleSelectToggle.displayName = "RoleSelectToggle";

export function RoleChipsSelect({
  disabled,
  isLoading,
  roleOptions,
  selectedRoleCodes,
  onToggleRole,
}) {
  const selectedRoles = roleOptions.filter((role) =>
    selectedRoleCodes.includes(role.code),
  );
  const selectedRolesText = selectedRoles.length
    ? selectedRoles.map((role) => getRoleLabel(role)).join(", ")
    : "Selecione uma ou mais roles";

  return (
    <Dropdown autoClose="outside">
      <Dropdown.Toggle
        as={RoleSelectToggle}
        disabled={disabled}
        title={selectedRolesText}
      >
        <ChipList>
          {selectedRoles.length ? (
            selectedRoles.map((role) => (
              <RoleChip key={role._id || role.code}>{getRoleLabel(role)}</RoleChip>
            ))
          ) : (
            <PlaceholderText>{selectedRolesText}</PlaceholderText>
          )}
        </ChipList>
      </Dropdown.Toggle>

      <RoleMenu>
        {roleOptions.map((role) => (
          <RoleOption key={role._id || role.code}>
            <Form.Check
              id={`user-role-${role._id || role.code}`}
              type="checkbox"
              label={getRoleLabel(role)}
              checked={selectedRoleCodes.includes(role.code)}
              onChange={() => onToggleRole(role.code)}
              disabled={isLoading}
            />
          </RoleOption>
        ))}
      </RoleMenu>
    </Dropdown>
  );
}

const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 50px;
  padding: 8px 42px 8px 12px;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 10px;
  background:
    linear-gradient(45deg, transparent 50%, oklch(45% 0.018 245) 50%) right
      16px center / 7px 7px no-repeat,
    linear-gradient(135deg, oklch(45% 0.018 245) 50%, transparent 50%) right
      10px center / 7px 7px no-repeat,
    oklch(99% 0.004 240);
  color: oklch(22% 0.018 245);
  text-align: left;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;

  &:focus {
    border-color: oklch(55% 0.17 253);
    box-shadow: 0 0 0 0.22rem oklch(55% 0.17 253 / 0.14);
    outline: none;
  }

  &::after {
    display: none;
  }

  &:disabled {
    cursor: not-allowed;
    background-color: oklch(94% 0.006 240);
    color: oklch(52% 0.014 245);
  }
`;

const ChipList = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
`;

const RoleChip = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border: 1px solid oklch(84% 0.05 253);
  border-radius: 999px;
  background: oklch(96% 0.026 253);
  color: oklch(38% 0.14 253);
  font-size: 0.86rem;
  font-weight: 700;
`;

const PlaceholderText = styled.span`
  color: oklch(58% 0.018 245);
`;

const RoleMenu = styled(Dropdown.Menu)`
  width: 100%;
  max-height: 260px;
  padding: 10px;
  overflow-y: auto;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 10px;
  box-shadow: 0 14px 30px oklch(22% 0.018 245 / 0.12);
`;

const RoleOption = styled.div`
  padding: 6px 4px;

  .form-check {
    margin: 0;
  }
`;
