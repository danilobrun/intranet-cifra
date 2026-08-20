import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { AdminUsersView } from ".";
import { getUsers } from "../../services/Users.service";

jest.mock("../../components/LayoutPortal", () => ({
  LayoutPortal: ({ children }) => <div>{children}</div>,
}));

jest.mock("../../services/Users.service", () => ({
  getUsers: jest.fn(),
  deleteUser: jest.fn(),
}));

describe("AdminUsersView", () => {
  beforeEach(() => {
    getUsers.mockResolvedValue([
      {
        _id: "user-1",
        name: "Ana",
        email: "ana@cifraengenharia.com.br",
        number: "1111-1111",
        roles: [{ _id: "role-1", code: "rh", cargo: "Recursos Humanos" }],
      },
      {
        _id: "user-2",
        name: "Bruno",
        email: "bruno@cifraengenharia.com.br",
        number: "2222-2222",
        roles: [{ _id: "role-2", code: "dono", cargo: "Diretoria" }],
      },
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("filtra usuarios pelo cargo e pelo codigo da role", async () => {
    render(
      <MemoryRouter>
        <AdminUsersView />
      </MemoryRouter>,
    );

    await waitFor(() => expect(getUsers).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Bruno")).toBeInTheDocument();

    const search = screen.getByRole("textbox", { name: "Pesquisar usuario" });

    fireEvent.change(search, { target: { value: "Recursos Humanos" } });
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.queryByText("Bruno")).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "dono" } });
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
    expect(screen.getByText("Bruno")).toBeInTheDocument();
  });
});
