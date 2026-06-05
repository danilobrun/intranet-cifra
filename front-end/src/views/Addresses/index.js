import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { PernambucoTab } from "../../components/Addresses/PernambucoTab";
import { Tab, Tabs } from "react-bootstrap";
import { AlagoasTab } from "../../components/Addresses/AlagoasTab";
import { SergipeTab } from "../../components/Addresses/SergipeTab";

export function Addresses() {
  return (
    <LayoutPortal>
      <PageTitle className="mt-4 mb-2">Endereços</PageTitle>
      <Div>
        <Tabs defaultActiveKey="pernambuco" id="uncontrolled-tab-example">
          <Tab eventKey="pernambuco" title="Pernambuco">
            <PernambucoTab />
          </Tab>
          <Tab eventKey="alagoas" title="Alagoas">
            <AlagoasTab />
          </Tab>
          <Tab eventKey="sergipe" title="Sergipe">
            <SergipeTab />
          </Tab>
        </Tabs>
      </Div>
    </LayoutPortal>
  );
}

const Div = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
`;

const PageTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: 10px;
`;
