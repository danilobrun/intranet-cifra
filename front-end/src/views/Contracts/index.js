import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { Tab, Tabs } from "react-bootstrap";
import { PernambucoContractTab } from "../../components/Contracts/PernambucoContractTab";
import { AlagoasContractTab } from "../../components/Contracts/AlagoasContractTab";
import { SergipeContractTab } from "../../components/Contracts/SergipeContractTab";
import { PiauiContractTab } from "../../components/Contracts/PiauiContractTab";

export function Contracts() {
  return (
    <LayoutPortal>
      <h1 className="mt-4 mb-2">📝 Contratos</h1>
      <Div>
        <Tabs defaultActiveKey="pernambuco" id="uncontrolled-tab-example">
          <Tab eventKey="pernambuco" title="Pernambuco">
            <PernambucoContractTab />
          </Tab>
          <Tab eventKey="alagoas" title="Alagoas">
            <AlagoasContractTab />
          </Tab>
          <Tab eventKey="sergipe" title="Sergipe">
            <SergipeContractTab />
          </Tab>
          <Tab eventKey="piaui" title="Piaui">
            <PiauiContractTab />
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
