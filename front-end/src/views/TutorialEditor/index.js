import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { LayoutPortal } from "../../components/LayoutPortal";
import { Loading } from "../../components/Loading";
import { TutorialInfoFields } from "../../components/Tutorials/TutorialInfoFields";
import { TutorialPreview } from "../../components/Tutorials/TutorialPreview";
import { TutorialStepsEditor } from "../../components/Tutorials/TutorialStepsEditor";
import {
  createTutorial,
  getTutorialById,
  updateTutorial,
} from "../../services/Tutorials.service";

const getEmptyStep = () => ({
  title: "",
  description: "",
  youtubeUrl: "",
  note: "",
  warning: "",
  expectedResult: "",
});

const getEmptyForm = () => ({
  title: "",
  summary: "",
  status: "rascunho",
  steps: [getEmptyStep()],
});

export function TutorialEditorView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState(getEmptyForm);
  const [loading, setLoading] = useState(isEditMode);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchTutorial = useCallback(async () => {
    if (!isEditMode) {
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      const data = await getTutorialById(id);
      setFormData({
        title: data.title || "",
        summary: data.summary || "",
        status: data.status || "rascunho",
        steps: data.steps?.length
          ? data.steps.map((step) => ({
              title: step.title || "",
              description: step.description || "",
              youtubeUrl: step.youtubeUrl || "",
              note: step.note || "",
              warning: step.warning || "",
              expectedResult: step.expectedResult || "",
            }))
          : [getEmptyStep()],
      });
    } catch {
      setErrorMsg("Falha ao buscar tutorial. Recarregue a página.");
    } finally {
      setLoading(false);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    fetchTutorial();
  }, [fetchTutorial]);

  const handleChange = (event) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [event.target.name]: event.target.value,
    }));
  };

  const handleChangeStep = (index, event) => {
    setFormData((currentFormData) => {
      const steps = [...currentFormData.steps];
      steps[index] = {
        ...steps[index],
        [event.target.name]: event.target.value,
      };

      return {
        ...currentFormData,
        steps,
      };
    });
  };

  const handleAddStep = () => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      steps: [...currentFormData.steps, getEmptyStep()],
    }));
  };

  const handleRemoveStep = (index) => {
    setFormData((currentFormData) => {
      if (currentFormData.steps.length === 1) {
        return {
          ...currentFormData,
          steps: [getEmptyStep()],
        };
      }

      return {
        ...currentFormData,
        steps: currentFormData.steps.filter(
          (_, stepIndex) => stepIndex !== index,
        ),
      };
    });
  };

  const handleMoveStep = (fromIndex, toIndex) => {
    setFormData((currentFormData) => {
      const steps = [...currentFormData.steps];
      const [selectedStep] = steps.splice(fromIndex, 1);
      steps.splice(toIndex, 0, selectedStep);

      return {
        ...currentFormData,
        steps,
      };
    });
  };

  const handleSubmit = async (nextStatus) => {
    const payload = {
      ...formData,
      status: nextStatus,
    };

    try {
      setIsSubmiting(true);

      const data = isEditMode
        ? await updateTutorial(id, payload)
        : await createTutorial(payload);

      toast.success(
        nextStatus === "publicado"
          ? "Tutorial publicado com sucesso."
          : "Tutorial salvo como rascunho.",
      );

      navigate(`/portal/tutorials/${data.tutorial._id}`);
    } catch (error) {
      toast.error(error.message || "Falha ao salvar tutorial.");
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <LayoutPortal>
      <HeaderRow>
        <div>
          <h1 className="mb-2">
            {isEditMode ? "Editar tutorial" : "Novo tutorial"}
          </h1>
          <Button
            as={Link}
            to="/portal/tutorials"
            variant="link"
            className="p-0"
          >
            Voltar para lista
          </Button>
        </div>

        <ActionsRow>
          <Button
            as={Link}
            to="/portal/tutorials"
            variant="outline-secondary"
            size="sm"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="outline-primary"
            size="sm"
            onClick={() => handleSubmit("rascunho")}
            disabled={isSubmiting || loading}
          >
            Salvar rascunho
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => handleSubmit("publicado")}
            disabled={isSubmiting || loading}
          >
            Publicar
          </Button>
        </ActionsRow>
      </HeaderRow>

      {loading ? <Loading /> : null}
      {errorMsg ? <Alert variant="danger">{errorMsg}</Alert> : null}

      {!loading && !errorMsg ? (
        <Form>
          <Row className="g-4">
            <Col lg={7} xl={8}>
              <FormPanel>
                <h2>Informações do tutorial</h2>
                <TutorialInfoFields
                  formData={formData}
                  onChange={handleChange}
                />
              </FormPanel>

              <FormPanel>
                <TutorialStepsEditor
                  steps={formData.steps}
                  onAddStep={handleAddStep}
                  onChangeStep={handleChangeStep}
                  onMoveStep={handleMoveStep}
                  onRemoveStep={handleRemoveStep}
                />
              </FormPanel>
            </Col>

            <Col lg={5} xl={4}>
              <TutorialPreview formData={formData} />
            </Col>
          </Row>
        </Form>
      ) : null}
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

const FormPanel = styled.div`
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 16px;
  background: #ffffff;
  margin-bottom: 16px;

  h2 {
    font-size: 1.125rem;
    margin-bottom: 16px;
  }
`;
