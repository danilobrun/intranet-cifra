import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { TableUsers } from "./TableUsers";

const renderTable = (users) =>
  render(
    <MemoryRouter>
      <TableUsers users={users} onDeleteUser={jest.fn()} />
    </MemoryRouter>,
  );

describe("TableUsers", () => {
  it("exibe ate tres roles e resume as roles excedentes", () => {
    renderTable([
      {
        _id: "user-1",
        name: "Usuario Teste",
        email: "usuario@cifraengenharia.com.br",
        number: "(79) 99999-9999",
        roles: [
          { _id: "role-1", code: "admin", cargo: "Administrador" },
          { _id: "role-2", code: "rh", cargo: "RH" },
          { _id: "role-3", code: "dono", cargo: "Dono" },
          { _id: "role-4", code: "ceo", cargo: "CEO" },
          { _id: "role-5", code: "gerente", cargo: "Gerente" },
        ],
      },
    ]);

    const row = screen.getByRole("row", { name: /Usuario Teste/i });

    expect(within(row).getByText("Administrador")).toBeInTheDocument();
    expect(within(row).getByText("RH")).toBeInTheDocument();
    expect(within(row).getByText("Dono")).toBeInTheDocument();
    expect(within(row).queryByText("CEO")).not.toBeInTheDocument();
    expect(within(row).queryByText("Gerente")).not.toBeInTheDocument();
    expect(
      within(row).getByLabelText("Mais 2 roles: CEO, Gerente"),
    ).toHaveTextContent("+2");
  });

  it("informa quando o usuario nao possui roles", () => {
    renderTable([
      {
        _id: "user-2",
        name: "Usuario sem role",
        email: "sem-role@cifraengenharia.com.br",
        number: "(79) 98888-8888",
        roles: [],
      },
    ]);

    const row = screen.getByRole("row", { name: /Usuario sem role/i });

    expect(within(row).getByText("Sem role")).toBeInTheDocument();
  });
});
