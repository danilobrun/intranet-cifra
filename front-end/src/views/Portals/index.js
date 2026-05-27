import { Alert, Col, Container, Row } from "react-bootstrap";
import { Layout } from "../../components/Layout";
import { CardPortals } from "../../components/CardPortals";
import { useEffect, useState } from "react";
import { Loading } from "../../components/Loading";
import { getPortals } from "../../services/Portals.service";
import styled from "styled-components";

export function PortalsView() {
  const [portals, setPortals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState();
  useEffect(() => {
    const fetchPortals = async () => {
      try {
        const data = await getPortals();
        setPortals(data);
      } catch {
        setErrorMsg(
          "Falha ao buscar portais. Recarregue a página. Caso o erro persista entre em contato com administrador Danilo Brun.",
        );
      }
      setLoading(false);
    };
    fetchPortals();
  }, []);

  const hasPortals = portals.length > 0;
  const portalCountLabel = `${portals.length} ${
    portals.length === 1 ? "portal" : "portais"
  }`;

  return (
    <Layout>
      <PageSection>
        <Container>
          <PageHeader>
            <div>
              <Title>Portais</Title>
            </div>
            {!loading && !errorMsg ? (
              <PortalCount aria-label={portalCountLabel}>
                {portalCountLabel}
              </PortalCount>
            ) : null}
          </PageHeader>

          {loading ? (
            <LoadingPanel>
              <Loading />
            </LoadingPanel>
          ) : null}

          {errorMsg ? (
            <Alert variant="danger" className="mb-4">
              {errorMsg}
            </Alert>
          ) : null}

          {!loading && !errorMsg && !hasPortals ? (
            <EmptyState>
              <strong>Nenhum portal disponivel.</strong>
              <span>Seu perfil ainda nao possui portais liberados.</span>
            </EmptyState>
          ) : null}

          {!loading && !errorMsg && hasPortals ? (
            <Row className="g-3 g-lg-4" as="section" aria-label="Portais">
              {portals.map((portal) => (
                <Col key={portal._id} xs={12} sm={6} lg={4} xl={3}>
                  <CardPortals portal={portal} />
                </Col>
              ))}
            </Row>
          ) : null}
        </Container>
      </PageSection>
    </Layout>
  );
}

const PageSection = styled.section`
  min-height: calc(100vh - 220px);
  padding: 2rem 0 3rem;
  background: #f8f9fa;
`;

const PageHeader = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  margin: 0;
  color: #212529;
  font-size: 2.5rem;
  font-weight: 500;
  line-height: 1.2;
`;

const PortalCount = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0.375rem 0.875rem;
  border: 1px solid #dee2e6;
  border-radius: 999px;
  background: #ffffff;
  color: #6c757d;
  font-weight: 600;
  white-space: nowrap;
`;

const LoadingPanel = styled.div`
  min-height: 16rem;
  display: grid;
  place-items: center;
`;

const EmptyState = styled.section`
  display: grid;
  gap: 0.25rem;
  padding: 1.5rem;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #6c757d;

  strong {
    color: #212529;
    font-size: 1.1rem;
  }
`;
