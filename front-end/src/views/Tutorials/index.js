import { useCallback, useEffect, useState } from "react";
import { Alert, Col, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { TutorialCard } from "../../components/Tutorials/TutorialCard";
import { TutorialCardsSkeleton } from "../../components/Tutorials/TutorialCardsSkeleton";
import { TutorialConfirmModal } from "../../components/Tutorials/TutorialConfirmModal";
import { TutorialFilters } from "../../components/Tutorials/TutorialFilters";
import { TutorialListHeader } from "../../components/Tutorials/TutorialListHeader";
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
      setErrorMsg("Falha ao buscar tutoriais. Recarregue a p\u00e1gina.");
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
        toast.success("Tutorial exclu\u00eddo definitivamente.");
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
      <TutorialListHeader
        isAdmin={isAdmin}
      />

      <TutorialFilters
        count={tutorials.length}
        isAdmin={isAdmin}
        isLoading={loading}
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />

      {errorMsg ? <Alert variant="danger">{errorMsg}</Alert> : null}

      {loading && !errorMsg ? <TutorialCardsSkeleton count={6} /> : null}

      {!loading && !errorMsg ? (
        tutorials.length ? (
          <Row className="g-3 g-lg-4">
            {tutorials.map((tutorial) => (
              <Col key={tutorial._id} xs={12} md={6} xl={4}>
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
          <EmptyState>
            <strong>Nenhum tutorial encontrado.</strong>
            <span>Tente alterar a busca ou o filtro selecionado.</span>
          </EmptyState>
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

const EmptyState = styled.div`
  display: grid;
  gap: 6px;
  padding: 26px;
  border: 1px dashed oklch(84% 0.014 245);
  border-radius: 12px;
  background: oklch(99% 0.004 245);
  color: oklch(49% 0.018 245);
  text-align: center;

  strong {
    color: oklch(28% 0.016 245);
    font-size: 1rem;
  }
`;
