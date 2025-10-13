import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/User/User.selectors";

const emptyFormData = {
  name: "",
  email: "",
  number: "",
  personalNumber: "",
  function: "",
  state: "",
  lotation: "",
  password: "",
  roleCodes: ["3"],
};

export function UpdateUserForm({
  initialValue = emptyFormData,
  buttonLabel = "Cadastrar",
  onSubmit,
}) {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [formData, setFormData] = useState(initialValue);
  const user = useSelector(selectUser);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "number" || name === "personalNumber") {
      let cleanedValue = value.replace(/\D/g, "");
      if (cleanedValue.length > 11) {
        cleanedValue = cleanedValue.slice(0, 11);
      }

      let numberFormatted = cleanedValue;

      if (cleanedValue.length > 2) {
        numberFormatted = `(${cleanedValue.slice(0, 2)}) ${cleanedValue.slice(
          2,
          7
        )}-${cleanedValue.slice(7)}`;
      }

      setFormData({
        ...formData,
        [name]: numberFormatted,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const handlesubmit = (event) => {
    event.preventDefault();
    setIsSubmiting(true);
    onSubmit(formData);
  };
  return (
    <Form onSubmit={handlesubmit}>
      <Form.Group className="mb-3" controlId="user-name">
        <Form.Label className="mb-0">Nome</Form.Label>
        <Form.Control
          type="text"
          placeholder="Nome do usuário"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="user-email">
        <Form.Label className="mb-0">Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Email do usuário"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="user-number">
        <Form.Label className="mb-0">Telefone Funcional</Form.Label>
        <Form.Control
          type="text"
          placeholder="Telefone funcional do usuário"
          name="number"
          value={formData.number}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="user-personal-number">
        <Form.Label className="mb-0">Telefone Pessoal</Form.Label>
        <Form.Control
          type="text"
          placeholder="Telefone pessoal do usuário"
          name="personalNumber"
          value={formData.personalNumber}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="user-function">
        <Form.Label className="mb-0">Função</Form.Label>
        <Form.Control
          type="text"
          placeholder="Função do usuário"
          name="function"
          value={formData.function}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="user-state">
        <Form.Label className="mb-0">Estado</Form.Label>
        <Form.Control
          type="text"
          placeholder="Estado do usuário"
          name="state"
          value={formData.state}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="user-lotation">
        <Form.Label className="mb-0">Lotação</Form.Label>
        <Form.Control
          type="text"
          placeholder="Lotação do usuário"
          name="lotation"
          value={formData.lotation}
          onChange={handleChange}
        />
      </Form.Group>
      {user.roles[0].code === "1" && (
        <Form.Group className="mb-3" controlId="user-roles">
          <Form.Label className="mb-0">Roles</Form.Label>
          <Form.Select
            name="roleCodes"
            value={formData.roleCodes || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map(
                (opt) => opt.value
              );
              setFormData({
                ...formData,
                roleCodes: selected,
              });
            }}
            required
          >
            <option value="compesa">Compesa</option>
            <option value="recruitment">Recruitment</option>
            <option value="gca">GCA</option>
            <option value="brk">BRK</option>
            <option value="verdeAlagoas">Verde Alagoas</option>
            <option value="alagoasGerente">Gerente Alagoas</option>
            <option value="sergipe">Sergipe</option>
            <option value="iguá">Iguá</option>
            <option value="obras">Obras</option>
            <option value="almoxarifado">Almoxarifado</option>
            <option value="rh">RH</option>
            <option value="financeiro">Financeiro</option>
            <option value="frota">Frota</option>
            <option value="3">Funcionário</option>
          </Form.Select>
        </Form.Group>
      )}
      <Form.Group className="mb-3" controlId="user-password">
        <Form.Label className="mb-0">Senha</Form.Label>
        <Form.Control
          type="password"
          placeholder="Insira a senha"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Button type="submit" disabled={isSubmiting}>
        {buttonLabel}
      </Button>
    </Form>
  );
}
