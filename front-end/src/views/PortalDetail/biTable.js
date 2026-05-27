import { Alert } from "react-bootstrap";
import {
  faChartBar,
  faClock,
  faDatabase,
  faEnvelope,
  faExternalLinkAlt,
  faLink,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import {
  CellLink,
  ColumnTitle,
  HeaderIcon,
  LinkIcon,
  PortalTable,
  SectionHeader,
  SectionIcon,
  SectionTitle,
  TableCard,
  TableScroll,
} from "./styles";

export function BiTable({ responsible, portal }) {
  const portalDetails = Array.isArray(portal) ? portal : [];

  return (
    <>
      <SectionHeader>
        <SectionIcon icon={faLink} />
        <SectionTitle>Links / Horários</SectionTitle>
      </SectionHeader>

      {portalDetails.length ? (
        <TableCard>
          <TableScroll>
            <PortalTable $wide>
              <thead>
                <tr>
                  <th>
                    <ColumnTitle>
                      <HeaderIcon icon={faChartBar} />
                      BI
                    </ColumnTitle>
                  </th>
                  <th>
                    <ColumnTitle>
                      <HeaderIcon icon={faExternalLinkAlt} />
                      Link para acessar o BI
                    </ColumnTitle>
                  </th>
                  <th>
                    <ColumnTitle>
                      <HeaderIcon icon={faDatabase} />
                      Link da Base
                    </ColumnTitle>
                  </th>
                  <th>
                    <ColumnTitle>
                      <HeaderIcon icon={faClock} />
                      Horários de Atualização
                    </ColumnTitle>
                  </th>
                  <th>
                    <ColumnTitle>
                      <HeaderIcon icon={faUser} />
                      Responsável
                    </ColumnTitle>
                  </th>
                  <th>
                    <ColumnTitle>
                      <HeaderIcon icon={faEnvelope} />
                      E-mail
                    </ColumnTitle>
                  </th>
                </tr>
              </thead>
              <tbody>
                {portalDetails.map((item, index) => (
                  <tr key={index}>
                    <td>{item.nameForm || ""}</td>
                    <td>
                      <CellLink
                        href={item.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Acessar BI ${item.nameForm || ""}`}
                        title="Acessar BI"
                      >
                        <LinkIcon icon={faExternalLinkAlt} />
                      </CellLink>
                    </td>
                    <td>
                      <CellLink
                        href={item.baseLink || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Acessar base ${item.nameForm || ""}`}
                        title="Acessar Base"
                      >
                        <LinkIcon icon={faExternalLinkAlt} />
                      </CellLink>
                    </td>
                    <td>{item.updateSchedule || ""}</td>
                    <td>{responsible || ""}</td>
                    <td>{item.emailResponsible || ""}</td>
                  </tr>
                ))}
              </tbody>
            </PortalTable>
          </TableScroll>
        </TableCard>
      ) : (
        <Alert variant="info">Não existe links e horários disponíveis.</Alert>
      )}
    </>
  );
}
