import { useCallback, useEffect, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { Loading } from "../../components/Loading";
import { TutorialConfirmModal } from "../../components/Tutorials/TutorialConfirmModal";
import { TutorialStatusBadge } from "../../components/Tutorials/TutorialStatusBadge";
import { TutorialStepTimeline } from "../../components/Tutorials/TutorialStepTimeline";
import {
  archiveTutorial,
  deleteTutorialPermanently,
  getTutorialById,
  updateTutorialStatus,
} from "../../services/Tutorials.service";
import { selectUser } from "../../store/User/User.selectors";

const isAdminUser = (user) => user?.roles?.[0]?.code === "1";

export function TutorialDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isAdmin = isAdminUser(user);
  const [tutorial, setTutorial] = useState();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [action, setAction] = useState();
  const [isSubmiting, setIsSubmiting] = useState(false);

  const fetchTutorial = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const data = await getTutorialById(id);
      setTutorial(data);
    } catch {
      setErrorMsg("Falha ao buscar tutorial. Recarregue a página.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTutorial();
  }, [fetchTutorial]);

  const handleStatusChange = async (status) => {
    try {
      setIsSubmiting(true);
      const data = await updateTutorialStatus(id, status);
      setTutorial(data.tutorial);
      toast.success("Status do tutorial atualizado.");
    } catch (error) {
      toast.error(error.message || "Falha ao atualizar status.");
    } finally {
      setIsSubmiting(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!tutorial?._id) {
      return;
    }

    try {
      setIsSubmiting(true);

      if (action.type === "deletePermanent") {
        await deleteTutorialPermanently(tutorial._id);
        toast.success("Tutorial excluído definitivamente.");
        navigate("/portal/tutorials");
        return;
      }

      const data = await archiveTutorial(tutorial._id);
      setTutorial(data.tutorial);
      toast.success("Tutorial arquivado com sucesso.");
      setAction(undefined);
    } catch (error) {
      toast.error(error.message || "Falha ao atualizar tutorial.");
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <LayoutPortal>
      <HeaderRow>
        <div>
          <Button
            as={Link}
            to="/portal/tutorials"
            variant="link"
            className="p-0"
          >
            Voltar para lista
          </Button>
          <h1 className="mb-2">{tutorial?.title || "Tutoriais"}</h1>
        </div>

        {isAdmin && tutorial ? (
          <ActionsRow>
            <Button
              size="sm"
              variant="outline-secondary"
              as={Link}
              to={`/portal/tutorials/${tutorial._id}/edit`}
            >
              Editar
            </Button>

            {tutorial.status === "publicado" ? (
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => handleStatusChange("rascunho")}
                disabled={isSubmiting}
              >
                Voltar para rascunho
              </Button>
            ) : null}

            {tutorial.status === "rascunho" ? (
              <Button
                size="sm"
                onClick={() => handleStatusChange("publicado")}
                disabled={isSubmiting}
              >
                Publicar
              </Button>
            ) : null}

            {tutorial.status === "arquivado" ? (
              <Button
                size="sm"
                variant="danger"
                onClick={() => setAction({ type: "deletePermanent", tutorial })}
                disabled={isSubmiting}
              >
                Excluir definitivo
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline-danger"
                onClick={() => setAction({ type: "archive", tutorial })}
                disabled={isSubmiting}
              >
                Arquivar
              </Button>
            )}
          </ActionsRow>
        ) : null}
      </HeaderRow>

      {loading ? <Loading /> : null}
      {errorMsg ? <Alert variant="danger">{errorMsg}</Alert> : null}

      {!loading && !errorMsg && tutorial ? (
        <ContentWrapper>
          <TitleRow>
            <div>{tutorial.summary ? <p>{tutorial.summary}</p> : null}</div>
            <TutorialStatusBadge status={tutorial.status} />
          </TitleRow>

          <TutorialStepTimeline steps={tutorial.steps} />
        </ContentWrapper>
      ) : null}

      <TutorialConfirmModal
        action={action}
        isSubmiting={isSubmiting}
        onCancel={() => setAction(undefined)}
        onConfirm={handleConfirmAction}
      />
    </LayoutPortal>
  );
}

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin: 16px 0;
  flex-wrap: wrap;
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ContentWrapper = styled.div`
  max-width: 960px;
  margin-bottom: 32px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;

  h2 {
    margin: 0 0 8px;
  }

  p {
    color: #6c757d;
    margin: 0;
  }
`;
