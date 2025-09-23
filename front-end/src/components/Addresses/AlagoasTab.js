import { Accordion } from "react-bootstrap";
import styled from "styled-components";
import { alagoas } from "./address";

export function AlagoasTab() {
  const alagoas1 = alagoas.filter((_, i) => i % 2 === 0);
  const alagoas2 = alagoas.filter((_, i) => i % 2 === 1);
  return (
    <DivAccordion>
      <Accordion>
        {alagoas1.map((item) => (
          <Accordion.Item eventKey={item.key} key={item.key} className="my-2">
            <Accordion.Header>{item.title}</Accordion.Header>
            <Accordion.Body>
              {item.endereco}
              <Iframe
                src={item.mapUrl}
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></Iframe>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>

      <Accordion>
        {alagoas2.map((item) => (
          <Accordion.Item eventKey={item.key} key={item.key} className="my-2">
            <Accordion.Header>{item.title}</Accordion.Header>
            <Accordion.Body>
              {item.endereco}
              <Iframe
                src={item.mapUrl}
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></Iframe>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </DivAccordion>
  );
}

const Iframe = styled.iframe`
  width: 100%;
  height: 300px;
  border: 0;
  margin-top: 10px;
  border-radius: 5px;
`;

const DivAccordion = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;

  @media (min-width: 992px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;
