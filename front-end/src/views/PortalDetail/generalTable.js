import {
  faEnvelope,
  faExternalLinkAlt,
  faLink,
  faTag,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import {
  CellLink,
  ColumnTitle,
  EmptyCell,
  HeaderIcon,
  LinkIcon,
  PortalTable,
  SectionHeader,
  SectionIcon,
  SectionTitle,
  TableCard,
  TableScroll,
} from "./styles";

export function GeneralTable({ portal }) {
  const portalDetails = Array.isArray(portal?.details) ? portal.details : [];

  return (
    <>
      <SectionHeader>
        <SectionIcon icon={faLink} />
        <SectionTitle>Links / Horários</SectionTitle>
      </SectionHeader>

      <TableCard>
        <TableScroll>
          <PortalTable>
            <thead>
              <tr>
                <th>
                  <ColumnTitle>
                    <HeaderIcon icon={faTag} />
                    Nome
                  </ColumnTitle>
                </th>
                <th>
                  <ColumnTitle>
                    <HeaderIcon icon={faExternalLinkAlt} />
                    Link
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
              {portalDetails.length ? (
                portalDetails.map((item, index) => (
                  <tr key={index}>
                    <td>{item.nameForm || ""}</td>
                    <td>
                      <CellLink
                        href={item.url}
                        aria-label={`Acessar formulário ${item.nameForm || ""}`}
                        title="Acessar formulário"
                      >
                        <LinkIcon icon={faExternalLinkAlt} />
                      </CellLink>
                    </td>
                    <td>{portal?.responsible || ""}</td>
                    <td>{item.emailResponsible || ""}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <EmptyCell colSpan="4">Nenhum dado encontrado.</EmptyCell>
                </tr>
              )}
            </tbody>
          </PortalTable>
        </TableScroll>
      </TableCard>
    </>
  );
}
