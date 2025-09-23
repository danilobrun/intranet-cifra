import { Accordion } from "react-bootstrap";
import { compesa } from "./address";
import styled from "styled-components";

export function PernambucoTab() {
  const compesa1 = compesa.filter((_, i) => i % 2 === 0);
  const compesa2 = compesa.filter((_, i) => i % 2 === 1);
  return (
    <>
      <P>Galpão e Administrativo</P>
      <DivAccordion>
        <Accordion>
          <Accordion.Item eventKey="guabiraba" className="my-2">
            <Accordion.Header>Guabiraba</Accordion.Header>
            <Accordion.Body>
              Estr. da Mumbeca, 305 F - Guabiraba, Paulista - PE, CEP:
              52490-005.
              <Iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3575.739683888518!2d-34.92368222544322!3d-7.9657429793919!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ab17003c5bc3d9%3A0x5446820b7e1cc2b1!2sCD%20Cifra%20Engenharia%20%2F%20Guabiraba!5e1!3m2!1spt-BR!2sbr!4v1758636615643!5m2!1spt-BR!2sbr"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        <Accordion>
          <Accordion.Item eventKey="jam" className="my-2">
            <Accordion.Header>JAM</Accordion.Header>
            <Accordion.Body>
              Av. Dr. José Augusto Moreira, 900 - Casa Caiada, Olinda - PE, CEP:
              53130-410.
              <Iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3575.5475262500495!2d-34.84133642544281!3d-7.987716779656078!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ab3daa0352c327%3A0xc48545026b339a53!2sJAM%20Olinda%20-%20Jos%C3%A9%20Augusto%20Moreira!5e1!3m2!1spt-BR!2sbr!4v1758636694804!5m2!1spt-BR!2sbr"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </DivAccordion>

      <Separator></Separator>
      <P>Compesa</P>
      <DivAccordion>
        <Accordion>
          {compesa1.map((item) => (
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
          {compesa2.map((item) => (
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
    </>
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

const P = styled.p`
  margin-bottom: 0;
  font-weight: bold;
  padding: 5px 0;
`;

const Separator = styled.span`
  width: 100%;
  height: 1px;
  background-color: #d1d1d1ff;
  display: block;
  margin: 10px 0;
`;
