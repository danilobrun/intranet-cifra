import { Tab, Tabs } from "react-bootstrap";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { PortalHeader } from "../../components/PortalHeader";
import { PernambucoTab } from "../../components/Addresses/PernambucoTab";
import { AlagoasTab } from "../../components/Addresses/AlagoasTab";
import { SergipeTab } from "../../components/Addresses/SergipeTab";

export function Addresses() {
  return (
    <LayoutPortal>
      <PortalHeader
        title="Endereços"
        icon={faLocationDot}
        description="Consulte os endereços operacionais por estado, copie dados rapidamente e abra o mapa apenas quando precisar."
      />

      <AddressTabs defaultActiveKey="pernambuco" id="addresses-tabs">
        <Tab eventKey="pernambuco" title="Pernambuco">
          <PernambucoTab />
        </Tab>
        <Tab eventKey="alagoas" title="Alagoas">
          <AlagoasTab />
        </Tab>
        <Tab eventKey="sergipe" title="Sergipe">
          <SergipeTab />
        </Tab>
      </AddressTabs>
    </LayoutPortal>
  );
}

const AddressTabs = styled(Tabs)`
  margin-top: 1rem;
  border-bottom: 1px solid oklch(88% 0.01 245);

  .nav-link {
    min-height: 44px;
    border: 0;
    border-bottom: 3px solid transparent;
    border-radius: 0;
    color: oklch(43% 0.018 245);
    font-weight: 750;
  }

  .nav-link:hover,
  .nav-link:focus {
    border-bottom-color: oklch(82% 0.014 245);
    color: oklch(25% 0.018 245);
  }

  .nav-link.active {
    border-bottom-color: oklch(55% 0.17 253);
    background: transparent;
    color: oklch(24% 0.018 245);
  }
`;
