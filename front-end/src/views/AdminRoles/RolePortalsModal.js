import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import styled from "styled-components";
import { Loading } from "../../components/Loading";

export function RolePortalsModal({
  show,
  role,
  portals,
  isLoading,
  isSubmiting,
  onHide,
  onSubmit,
}) {
  const [selectedPortalIds, setSelectedPortalIds] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!show || !role) {
      setSelectedPortalIds([]);
      setSearch("");
      return;
    }

    setSelectedPortalIds(role.portals?.map((portal) => portal._id) || []);
    setSearch("");
  }, [role, show]);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredPortals = !normalizedSearch
    ? portals
    : portals.filter((portal) => {
        return (
          portal.name?.toLowerCase().includes(normalizedSearch) ||
          portal.shortDescription?.toLowerCase().includes(normalizedSearch) ||
          portal.responsible?.toLowerCase().includes(normalizedSearch)
        );
      });

  const togglePortal = (portalId) => {
    setSelectedPortalIds((currentPortalIds) =>
      currentPortalIds.includes(portalId)
        ? currentPortalIds.filter(
            (currentPortalId) => currentPortalId !== portalId,
          )
        : [...currentPortalIds, portalId],
    );
  };

  const handleSubmit = () => {
    if (!role) {
      return;
    }

    onSubmit({
      cargo: role.cargo,
      code: role.code,
      portalIds: selectedPortalIds,
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton={!isSubmiting && !isLoading}>
        <Modal.Title>Controle de portais por role</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <Loading />
        ) : role ? (
          <>
            <HeaderRow>
              <div>
                <Title>{role.cargo}</Title>
                <CodeText>Code: {role.code}</CodeText>
              </div>
              <CounterText>
                {selectedPortalIds.length} portal(is) selecionado(s)
              </CounterText>
            </HeaderRow>

            <ActionRow>
              <SearchInput
                type="text"
                placeholder="Pesquisar portal"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() =>
                    setSelectedPortalIds(portals.map((portal) => portal._id))
                  }
                >
                  Marcar todos
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setSelectedPortalIds([])}
                >
                  Limpar
                </Button>
              </div>
            </ActionRow>

            <PortalList>
              {filteredPortals.length ? (
                filteredPortals.map((portal) => (
                  <PortalCard key={portal._id}>
                    <Form.Check
                      id={`role-portal-${portal._id}`}
                      type="checkbox"
                      checked={selectedPortalIds.includes(portal._id)}
                      onChange={() => togglePortal(portal._id)}
                      label=""
                    />
                    <PortalTextContent>
                      <PortalName>{portal.name}</PortalName>
                      {portal.shortDescription ? (
                        <PortalMeta>{portal.shortDescription}</PortalMeta>
                      ) : null}
                      {portal.responsible ? (
                        <PortalMeta>
                          Responsável: {portal.responsible}
                        </PortalMeta>
                      ) : null}
                    </PortalTextContent>
                  </PortalCard>
                ))
              ) : (
                <EmptyState>
                  Nenhum portal encontrado para esse filtro.
                </EmptyState>
              )}
            </PortalList>
          </>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onHide}
          disabled={isSubmiting || isLoading}
        >
          Cancelar
        </Button>
        <Button
          disabled={isSubmiting || isLoading || !role}
          onClick={handleSubmit}
        >
          Salvar alterações
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
`;

const CodeText = styled.p`
  margin: 4px 0 0;
  color: #6c757d;
`;

const CounterText = styled.p`
  margin: 0;
  font-weight: 600;
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  width: min(360px, 100%);
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  outline: none;
`;

const PortalList = styled.div`
  max-height: 55vh;
  overflow: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
  background: #f8f9fa;
`;

const PortalCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 0.5rem;
  background: #ffffff;
  border: 1px solid #dee2e6;
`;

const PortalTextContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PortalName = styled.span`
  font-weight: 600;
  color: #212529;
`;

const PortalMeta = styled.span`
  color: #6c757d;
  font-size: 0.9rem;
`;

const EmptyState = styled.div`
  color: #6c757d;
  padding: 16px;
`;
