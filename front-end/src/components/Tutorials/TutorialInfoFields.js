import { Form } from "react-bootstrap";
import { TutorialStatusBadge } from "./TutorialStatusBadge";

export function TutorialInfoFields({ formData, onChange }) {
  return (
    <>
      <Form.Group className="mb-3" controlId="tutorial-title">
        <Form.Label className="mb-0">Título</Form.Label>
        <Form.Control
          name="title"
          placeholder="Ex: GSANEOS fechando ao abrir fotos"
          value={formData.title}
          onChange={onChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="tutorial-summary">
        <Form.Label className="mb-0">Resumo</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="summary"
          placeholder="Explique rapidamente quando este tutorial deve ser usado"
          value={formData.summary}
          onChange={onChange}
        />
      </Form.Group>

      <div className="mb-3">
        <Form.Label className="mb-1 d-block">Status atual</Form.Label>
        <TutorialStatusBadge status={formData.status} />
      </div>
    </>
  );
}
