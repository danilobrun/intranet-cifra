import { useEffect, useRef, useState } from "react";
import { NavItem, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import { SidebarItem } from "./SidebarItem";

const getGroupTooltipId = (key) => `sidebar-group-tooltip-${key}`;

export function SidebarGroup({
  section,
  isCollapsed,
  isOpen,
  isActive,
  onToggle,
  onClose,
}) {
  const buttonRef = useRef(null);
  const flyoutRef = useRef(null);
  const [flyoutTop, setFlyoutTop] = useState(0);

  useEffect(() => {
    if (!isCollapsed || !isOpen) return undefined;

    const handlePointerDown = (event) => {
      const target = event.target;

      if (
        buttonRef.current?.contains(target) ||
        flyoutRef.current?.contains(target)
      ) {
        return;
      }

      onClose();
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCollapsed, isOpen, onClose]);

  const handleToggle = () => {
    if (isCollapsed && buttonRef.current) {
      setFlyoutTop(buttonRef.current.getBoundingClientRect().top);
    }

    onToggle();
  };

  const toggleButton = (
    <GroupToggleButton
      ref={buttonRef}
      type="button"
      aria-expanded={isOpen}
      aria-controls={`sidebar-section-${section.key}`}
      aria-label={isCollapsed ? section.label : undefined}
      $collapsed={isCollapsed}
      $active={isActive}
      onClick={handleToggle}
    >
      <GroupIcon aria-hidden="true" $collapsed={isCollapsed}>
        <FontAwesomeIcon icon={section.icon} fixedWidth />
      </GroupIcon>
      <GroupLabel $collapsed={isCollapsed}>{section.label}</GroupLabel>
      <Indicator
        aria-hidden="true"
        $isOpen={isOpen}
        $collapsed={isCollapsed}
      />
    </GroupToggleButton>
  );

  return (
    <GroupWrapper>
      {isCollapsed && !isOpen ? (
        <OverlayTrigger
          placement="right"
          delay={{ show: 250, hide: 0 }}
          overlay={
            <Tooltip id={getGroupTooltipId(section.key)}>
              {section.label}
            </Tooltip>
          }
        >
          {toggleButton}
        </OverlayTrigger>
      ) : (
        toggleButton
      )}

      {isCollapsed ? (
        <CollapsedFlyout
          id={`sidebar-section-${section.key}`}
          ref={flyoutRef}
          hidden={!isOpen}
          $top={flyoutTop}
        >
          <FlyoutTitle>{section.label}</FlyoutTitle>
          <FlyoutItems>
            {section.items.map((item) => (
              <SidebarItem
                key={item.to}
                item={item}
                isCollapsed={false}
                onNavigate={onClose}
              />
            ))}
          </FlyoutItems>
        </CollapsedFlyout>
      ) : (
        <GroupItems id={`sidebar-section-${section.key}`} hidden={!isOpen}>
          {section.items.map((item) => (
            <SidebarItem
              key={item.to}
              item={item}
              isCollapsed={false}
              isNested
            />
          ))}
        </GroupItems>
      )}
    </GroupWrapper>
  );
}

const GroupWrapper = styled(NavItem)`
  position: relative;
`;

const GroupToggleButton = styled.button`
  width: 100%;
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$collapsed ? "center" : "flex-start")};
  gap: ${(props) => (props.$collapsed ? "0" : "12px")};
  padding: ${(props) => (props.$collapsed ? "0.625rem 0" : "0.625rem 0.75rem")};
  border: 0;
  border-radius: 8px;
  background: ${(props) =>
    props.$active && props.$collapsed
      ? "rgba(13, 110, 253, 0.92)"
      : props.$active
        ? "rgba(248, 249, 250, 0.1)"
        : "transparent"};
  color: ${(props) =>
    props.$active ? "#ffffff" : "rgba(248, 249, 250, 0.86)"};
  font: inherit;
  font-weight: 700;
  line-height: 1.2;
  text-align: left;
  transition:
    background-color 180ms ease-out,
    color 180ms ease-out;

  &:hover,
  &:focus {
    background: ${(props) =>
      props.$active && props.$collapsed
        ? "#0d6efd"
        : "rgba(248, 249, 250, 0.14)"};
    color: #f8f9fa;
  }

  &:focus-visible {
    outline: 2px solid rgba(248, 249, 250, 0.45);
    outline-offset: 2px;
  }

  @media (max-width: 991px) {
    justify-content: flex-start;
    gap: 12px;
    padding: 0.625rem 0.75rem;
  }
`;

const GroupIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => (props.$collapsed ? "100%" : "22px")};
  min-width: 22px;
  font-size: ${(props) => (props.$collapsed ? "1.05rem" : "0.95rem")};

  @media (max-width: 991px) {
    width: 22px;
    font-size: 0.95rem;
  }
`;

const GroupLabel = styled.span`
  min-width: 0;
  max-width: ${(props) => (props.$collapsed ? "0" : "160px")};
  overflow: hidden;
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  white-space: nowrap;
  transition:
    max-width 150ms ease-out,
    opacity 120ms ease-out;

  @media (max-width: 991px) {
    max-width: 160px;
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Indicator = styled.span`
  flex: 0 0 auto;
  display: ${(props) => (props.$collapsed ? "none" : "block")};
  margin-left: auto;
  position: relative;
  top: ${(props) => (props.$isOpen ? "-1px" : "1px")};
  width: 0.55rem;
  height: 0.55rem;
  border-right: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
  transform: rotate(${(props) => (props.$isOpen ? "45deg" : "225deg")});
  transition:
    top 150ms ease-out,
    transform 150ms ease-out;

  @media (max-width: 991px) {
    display: block;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const GroupItems = styled.div`
  display: grid;
  gap: 0.125rem;
  padding: 0.125rem 0 0.375rem 0.75rem;

  &[hidden] {
    display: none;
  }
`;

const CollapsedFlyout = styled.div`
  position: fixed;
  left: 92px;
  top: ${(props) => `${props.$top}px`};
  z-index: 1100;
  width: 280px;
  display: grid;
  gap: 0.5rem;
  padding: 0.625rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 0.5rem;
  background: #212529;
  box-shadow: 0 18px 42px rgba(17, 24, 39, 0.26);

  &[hidden] {
    display: none;
  }
`;

const FlyoutTitle = styled.div`
  padding: 0.25rem 0.5rem 0.125rem;
  color: rgba(248, 249, 250, 0.72);
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
`;

const FlyoutItems = styled.div`
  display: grid;
  gap: 0.125rem;
`;
