import { useEffect, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";

const emptyFormData = {
  cargo: "",
  code: "",
  portalIds: [],
};

const normalizeFormData = (value = emptyFormData) => ({
  cargo: String(value.cargo || ""),
  code: String(value.code || ""),
  portalIds: Array.isArray(value.portalIds) ? [...value.portalIds] : [],
});

export function UpsertRoleForm({
  initialValue = emptyFormData,
  buttonLabel = "Cadastrar",
  helperText,
  isSubmittingExternal = false,
  onSubmit,
}) {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [formData, setFormData] = useState(() =>
    normalizeFormData(initialValue),
  );

  useEffect(() => {
    setFormData(normalizeFormData(initialValue));
  }, [initialValue]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmiting(true);

    try {
      await onSubmit({
        cargo: String(formData.cargo || "").trim(),
        code: String(formData.code || "").trim(),
        portalIds: Array.isArray(formData.portalIds) ? formData.portalIds : [],
      });
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {helperText ? (
        <Alert variant="info" className="mt-3">
          {helperText}
        </Alert>
      ) : null}

      <Form.Group className="mb-3" controlId="role-cargo">
        <Form.Label className="mb-0">Cargo</Form.Label>
        <Form.Control
          type="text"
          placeholder="Nome do cargo da role"
          name="cargo"
          value={formData.cargo}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="role-code">
        <Form.Label className="mb-0">Code</Form.Label>
        <Form.Control
          type="text"
          placeholder="Codigo unico da role"
          name="code"
          value={formData.code}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Button type="submit" disabled={isSubmiting || isSubmittingExternal}>
        {buttonLabel}
      </Button>
    </Form>
  );
}
