import { useCallback, useEffect, useState } from "react";
import { Alert, Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Loading } from "../../components/Loading";
import { getPortalById } from "../../services/Portals.service";
import { NotFoundView } from "../NotFound";
import { Inscriptions } from "./inscriptions";
import { InscriptionsForm } from "./inscriptionsForm";
import styled from "styled-components";

export function PortalDetailView() {
  const { id } = useParams();
  const [portal, setPortal] = useState();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState();
  const fetchPortal = useCallback(async () => {
    try {
      const data = await getPortalById(id);
      setPortal(data);
      setLoading(false);
    } catch (err) {
      const message =
        err.message === "Reponse not ok."
          ? "404"
          : "Falha ao buscar informações dos portais, por favor recarregue a página.";
      setErrorMsg(message);
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    fetchPortal();
  }, [fetchPortal]);
  if (loading) {
    return <Loading />;
  }
  if (errorMsg === "404") {
    return <NotFoundView />;
  }
  return (
    <Layout>
      <ContainerStyled>
        {errorMsg ? (
          <Alert variant="danger" className="mt-3">
            {errorMsg}
          </Alert>
        ) : (
          <>
            <h1 className="text-center mt-4">{portal.name}</h1>
            <p>
              <strong>Responsáveis:</strong> {portal.responsible}
            </p>
            <p>{portal.description}</p>
            <Inscriptions inscriptions={portal.inscriptions} />
            <InscriptionsForm portalId={id} onRegister={fetchPortal} />
          </>
        )}
      </ContainerStyled>
    </Layout>
  );
}

const ContainerStyled = styled(Container)`
  max-width: 900px;
`;
