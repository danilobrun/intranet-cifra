import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Loading } from "../../components/Loading";
import { getPortalById } from "../../services/Portals.service";
import { NotFoundView } from "../NotFound";
import { BiTable } from "./biTable";
import { GeneralTable } from "./generalTable";
import {
  IntroSection,
  PageContainer,
  PortalDescription,
  PortalTitle,
} from "./styles";

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

  const isBi = /^BI/i.test(portal.name.trim());
  return (
    <Layout>
      <PageContainer>
        {errorMsg ? (
          <Alert variant="danger" className="mt-3">
            {errorMsg}
          </Alert>
        ) : (
          <>
            <IntroSection>
              <PortalTitle>{portal.name}</PortalTitle>
              <PortalDescription>{portal.description}</PortalDescription>
            </IntroSection>
            {isBi ? (
              <BiTable
                responsible={portal.responsible}
                portal={portal.details}
              />
            ) : (
              <GeneralTable portal={portal} />
            )}
          </>
        )}
      </PageContainer>
    </Layout>
  );
}
