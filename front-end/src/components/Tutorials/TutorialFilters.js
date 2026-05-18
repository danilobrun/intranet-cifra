import { Form } from "react-bootstrap";
import styled from "styled-components";

export function TutorialFilters({
  isAdmin,
  search,
  status,
  onSearchChange,
  onStatusChange,
}) {
  return (
    <FiltersRow>
      <SearchInput
        type="text"
        placeholder="Pesquisar tutorial"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      {isAdmin ? (
        <StatusSelect
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          <option value="todos">Todos os status</option>
          <option value="publicado">Publicados</option>
          <option value="rascunho">Rascunhos</option>
          <option value="arquivado">Arquivados</option>
        </StatusSelect>
      ) : null}
    </FiltersRow>
  );
}

const FiltersRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 16px 0;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  width: min(420px, 100%);
  height: 42px;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  outline: none;
`;

const StatusSelect = styled(Form.Select)`
  width: min(220px, 100%);
  height: 42px;
`;
