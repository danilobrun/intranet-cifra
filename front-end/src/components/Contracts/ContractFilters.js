import { Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import {
  CONTRACT_CLIENT_OPTIONS,
  CONTRACT_CODE_OPTIONS,
  CONTRACT_STATE_OPTIONS,
  CONTRACT_STATUS_OPTIONS,
} from "./options";

export function ContractFilters({
  filters,
  managerOptions = [],
  canManageAll = false,
  isLoading = false,
  total = 0,
  onChange,
}) {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onChange({
      ...filters,
      [name]: value,
    });
  };

  return (
    <FiltersPanel>
      <FiltersHeader>
        <HeaderTitle>
          <FontAwesomeIcon icon={faFilter} />
          Filtros
        </HeaderTitle>
        <ResultCount>
          {isLoading ? "Carregando..." : `${total} contrato(s)`}
        </ResultCount>
      </FiltersHeader>

      <FiltersGrid>
        <FilterField controlId="contract-filter-search">
          <FilterLabel>Nome</FilterLabel>
          <SearchField>
            <SearchIcon icon={faMagnifyingGlass} />
            <Control
              type="text"
              name="search"
              value={filters.search}
              placeholder="Buscar por nome"
              aria-label="Buscar por nome do contrato"
              onChange={handleChange}
            />
          </SearchField>
        </FilterField>

        <FilterField controlId="contract-filter-codigo">
          <FilterLabel>Código</FilterLabel>
          <Select name="codigo" value={filters.codigo} onChange={handleChange}>
            <option value="">Todos</option>
            {CONTRACT_CODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField controlId="contract-filter-cliente">
          <FilterLabel>Cliente</FilterLabel>
          <Select name="cliente" value={filters.cliente} onChange={handleChange}>
            <option value="">Todos</option>
            {CONTRACT_CLIENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField controlId="contract-filter-estado">
          <FilterLabel>Estado</FilterLabel>
          <Select name="estado" value={filters.estado} onChange={handleChange}>
            <option value="">Todos</option>
            {CONTRACT_STATE_OPTIONS.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField controlId="contract-filter-gestor">
          <FilterLabel>Gestor</FilterLabel>
          <Select
            name="gestorId"
            value={filters.gestorId}
            onChange={handleChange}
            disabled={!canManageAll}
          >
            <option value="">{canManageAll ? "Todos" : "Meus contratos"}</option>
            {managerOptions.map((manager) => (
              <option key={manager._id} value={manager._id}>
                {manager.name}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField controlId="contract-filter-status">
          <FilterLabel>Status</FilterLabel>
          <Select name="status" value={filters.status} onChange={handleChange}>
            <option value="todos">Todos</option>
            {CONTRACT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </FilterField>
      </FiltersGrid>
    </FiltersPanel>
  );
}

const FiltersPanel = styled.section`
  display: grid;
  gap: 16px;
  margin: 18px 0;
  padding: 18px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 10px;
  background: oklch(99% 0.004 245);
`;

const FiltersHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const HeaderTitle = styled.h2`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin: 0;
  color: oklch(28% 0.016 245);
  font-size: 1rem;
  font-weight: 760;
`;

const ResultCount = styled.span`
  color: oklch(49% 0.018 245);
  font-size: 0.92rem;
  font-weight: 650;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(260px, 1.35fr) repeat(5, minmax(150px, 1fr));
  gap: 14px 14px;
  align-items: end;

  @media (max-width: 1199.98px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr;
  }
`;

const FilterField = styled(Form.Group)`
  display: grid;
  min-width: 0;
  gap: 7px;
`;

const SearchField = styled.div`
  position: relative;
  min-width: 0;
`;

const SearchIcon = styled(FontAwesomeIcon)`
  position: absolute;
  top: 50%;
  left: 14px;
  color: oklch(49% 0.018 245);
  font-size: 0.9rem;
  pointer-events: none;
  transform: translateY(-50%);
`;

const FilterLabel = styled(Form.Label)`
  margin: 0;
  color: oklch(31% 0.018 245);
  font-size: 0.88rem;
  font-weight: 700;
`;

const Control = styled(Form.Control)`
  min-height: 42px;
  padding-left: 38px;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 8px;
  background-color: oklch(99% 0.004 240);
  color: oklch(22% 0.018 245);

  &:focus {
    border-color: oklch(55% 0.17 253);
    box-shadow: 0 0 0 0.2rem oklch(55% 0.17 253 / 0.12);
  }
`;

const Select = styled(Form.Select)`
  min-height: 42px;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 8px;
  background-color: oklch(99% 0.004 240);
  color: oklch(22% 0.018 245);

  &:focus {
    border-color: oklch(55% 0.17 253);
    box-shadow: 0 0 0 0.2rem oklch(55% 0.17 253 / 0.12);
  }
`;
