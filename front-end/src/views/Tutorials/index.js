import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { Loading } from "../../components/Loading";
import { TutorialCard } from "../../components/Tutorials/TutorialCard";
import { TutorialConfirmModal } from "../../components/Tutorials/TutorialConfirmModal";
import { TutorialFilters } from "../../components/Tutorials/TutorialFilters";
import {
  archiveTutorial,
  deleteTutorialPermanently,
  getAdminTutorials,
  getTutorials,
} from "../../services/Tutorials.service";
import { selectUser } from "../../store/User/User.selectors";

const isAdminUser = (user) => user?.roles?.[0]?.code === "1";

export function TutorialsView() {
  const user = useSelector(selectUser);
  const isAdmin = isAdminUser(user);
  const [tutorials, setTutorials] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [action, setAction] = useState();
  const [isSubmiting, setIsSubmiting] = useState(false);

  const fetchTutorials = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const data = isAdmin
        ? await getAdminTutorials({ search, status })
        : await getTutorials({ search });

      setTutorials(data || []);
    } catch {
      setErrorMsg("Falha ao buscar tutoriais. Recarregue a página.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, search, status]);

  useEffect(() => {
    const timeout = setTimeout(fetchTutorials, 250);

    return () => clearTimeout(timeout);
  }, [fetchTutorials]);

  const handleConfirmAction = async () => {
    if (!action?.tutorial?._id) {
      return;
    }

    try {
      setIsSubmiting(true);

      if (action.type === "deletePermanent") {
        await deleteTutorialPermanently(action.tutorial._id);
        toast.success("Tutorial excluído definitivamente.");
      } else {
        await archiveTutorial(action.tutorial._id);
        toast.success("Tutorial arquivado com sucesso.");
      }

      setAction(undefined);
      await fetchTutorials();
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
          <TitleRow>
            <h1 className="mb-0">🔎 Tutoriais</h1>
            {isAdmin ? (
              <Button
                as={Link}
                to="/portal/tutorials/new"
                size="sm"
                className="mt-2"
              >
                Novo tutorial
              </Button>
            ) : null}
          </TitleRow>
          <HelperText>
            Consulte procedimentos internos em formato de passo a passo.
          </HelperText>
        </div>
      </HeaderRow>

      <TutorialFilters
        isAdmin={isAdmin}
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />

      {loading ? <Loading /> : null}
      {errorMsg ? <Alert variant="danger">{errorMsg}</Alert> : null}

      {!loading && !errorMsg ? (
        tutorials.length ? (
          <Row>
            {tutorials.map((tutorial) => (
              <Col key={tutorial._id} className="mb-4" xs={12} md={6} xl={4}>
                <TutorialCard
                  tutorial={tutorial}
                  isAdmin={isAdmin}
                  onArchive={(selectedTutorial) =>
                    setAction({
                      type: "archive",
                      tutorial: selectedTutorial,
                    })
                  }
                  onDeletePermanently={(selectedTutorial) =>
                    setAction({
                      type: "deletePermanent",
                      tutorial: selectedTutorial,
                    })
                  }
                />
              </Col>
            ))}
          </Row>
        ) : (
          <EmptyState>Nenhum tutorial encontrado.</EmptyState>
        )
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

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const HelperText = styled.p`
  margin: 8px 0 0;
  color: #6c757d;
`;

const EmptyState = styled.div`
  border: 1px dashed #ced4da;
  border-radius: 0.5rem;
  padding: 24px;
  color: #6c757d;
  text-align: center;
`;
