import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";

const emptyFormData = {
  placa: "",
  condutor: "",
  contrato: "",
  estado: "",
  crlv: "",
};

const normalizeFormData = (value = emptyFormData) => ({
  placa: String(value.placa || ""),
  condutor: String(value.condutor || ""),
  contrato: String(value.contrato || ""),
  estado: String(value.estado || ""),
  crlv: String(value.crlv || ""),
});

const normalizePlateValue = (value) =>
  String(value || "")
    .replace(/[\s-]/g, "")
    .toUpperCase();

export function PlateForm({
  initialValue = emptyFormData,
  mode = "create",
  buttonLabel = "Cadastrar",
  isSubmittingExternal = false,
  onSubmit,
}) {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [formData, setFormData] = useState(() =>
    normalizeFormData(initialValue),
  );
  const isEditMode = mode === "edit";

  useEffect(() => {
    setFormData(normalizeFormData(initialValue));
  }, [initialValue]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: name === "placa" ? normalizePlateValue(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmiting(true);

    const normalizedPlate = normalizePlateValue(formData.placa);

    const payload = {
      condutor: formData.condutor.trim(),
      contrato: formData.contrato.trim(),
      estado: formData.estado.trim(),
      crlv: formData.crlv.trim(),
    };

    if (!isEditMode) {
      if (normalizedPlate.length !== 7) {
        setIsSubmiting(false);
        return;
      }

      payload.placa = normalizedPlate;
    }

    try {
      await onSubmit(payload);
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="plate-placa">
        <Form.Label className="mb-0">Placa</Form.Label>
        <Form.Control
          type="text"
          placeholder="ABC1D23"
          name="placa"
          value={formData.placa}
          onChange={handleChange}
          disabled={isEditMode}
          required={!isEditMode}
          minLength={7}
          maxLength={7}
          pattern="[A-Z0-9]{7}"
        />
        <Form.Text muted>
          {isEditMode
            ? "A placa não pode ser alterada depois de criada."
            : "Informe exatamente 7 caracteres, sem espaços ou traços."}
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="plate-condutor">
        <Form.Label className="mb-0">Condutor</Form.Label>
        <Form.Control
          type="text"
          placeholder="Nome do condutor"
          name="condutor"
          value={formData.condutor}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="plate-contrato">
        <Form.Label className="mb-0">Contrato</Form.Label>
        <Form.Control
          type="text"
          placeholder="Contrato"
          name="contrato"
          value={formData.contrato}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="plate-estado">
        <Form.Label className="mb-0">Estado</Form.Label>
        <Form.Control
          type="text"
          placeholder="Estado"
          name="estado"
          value={formData.estado}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="plate-crlv">
        <Form.Label className="mb-0">Número do CRLV</Form.Label>
        <Form.Control
          type="text"
          placeholder="Número do CRLV"
          name="crlv"
          value={formData.crlv}
          onChange={handleChange}
        />
      </Form.Group>

      <Button type="submit" disabled={isSubmiting || isSubmittingExternal}>
        {buttonLabel}
      </Button>
    </Form>
  );
}
