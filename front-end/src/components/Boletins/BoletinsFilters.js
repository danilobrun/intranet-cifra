import { Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import {
  BOLETIM_FATURAMENTO_STATUS_OPTIONS,
  BOLETIM_MONTH_OPTIONS,
  BOLETIM_PAGAMENTO_STATUS_OPTIONS,
  BOLETIM_VALOR_TOTAL_SORT_OPTIONS,
} from "./options";

const getId = (item) => item?._id || item?.id || "";

const getUserName = (user) => {
  if (!user) {
    return "";
  }

  return typeof user === "string" ? user : user.name || "";
};

const getContractLabel = (contract) => {
  const code = contract?.codigo ? `${contract.codigo} - ` : "";
  return `${code}${contract?.nomeContrato || "Contrato"}`;
};

const getUniqueOptions = (items = [], fieldName) => {
  const values = new Map();

  items.forEach((item) => {
    const value = item?.[fieldName];

    if (value) {
      values.set(String(value), String(value));
    }
  });

  return Array.from(values.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((left, right) => left.label.localeCompare(right.label, "pt-BR"));
};

export function BoletinsFilters({
  filters,
  contractOptions = [],
  managerOptions = [],
  canManageAll = false,
  isLoading = false,
  showValueSort = true,
  total = 0,
  onChange,
}) {
  const clienteOptions = getUniqueOptions(contractOptions, "cliente");
  const estadoOptions = getUniqueOptions(contractOptions, "estado");

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
          {isLoading ? "Carregando..." : `${total} boletim(ns)`}
        </ResultCount>
      </FiltersHeader>

      <FiltersGrid>
        <FilterField controlId="boletim-filter-numero">
          <FilterLabel>Buscar BM</FilterLabel>
          <SearchField>
            <SearchIcon icon={faMagnifyingGlass} />
            <Control
              type="text"
              name="numeroBm"
              value={filters.numeroBm}
              placeholder="Buscar No. BM"
              aria-label="Buscar por numero do BM"
              onChange={handleChange}
            />
          </SearchField>
        </FilterField>

        <FilterField controlId="boletim-filter-cliente">
          <FilterLabel>Cliente</FilterLabel>
          <Select
            name="cliente"
            value={filters.cliente}
            onChange={handleChange}
          >
            <option value="">Todos</option>
            {clienteOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField controlId="boletim-filter-contrato">
          <FilterLabel>Contrato</FilterLabel>
          <Select
            name="contratoId"
            value={filters.contratoId}
            onChange={handleChange}
          >
            <option value="">Todos</option>
            {contractOptions.map((contract) => (
              <option key={getId(contract)} value={getId(contract)}>
                {getContractLabel(contract)}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField controlId="boletim-filter-estado">
          <FilterLabel>Estado</FilterLabel>
          <Select name="estado" value={filters.estado} onChange={handleChange}>
            <option value="">Todos</option>
            {estadoOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField controlId="boletim-filter-gestor">
          <FilterLabel>Gestor</FilterLabel>
          <Select
            name="gestorId"
            value={filters.gestorId}
            onChange={handleChange}
            disabled={!canManageAll}
          >
            <option value="">{canManageAll ? "Todos" : "Meus BMs"}</option>
            {managerOptions.map((manager) => (
              <option key={getId(manager)} value={getId(manager)}>
                {getUserName(manager)}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField controlId="boletim-filter-mes">
          <FilterLabel>Mês</FilterLabel>
          <Select name="mes" value={filters.mes} onChange={handleChange}>
            <option value="">Todos</option>
            {BOLETIM_MONTH_OPTIONS.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField controlId="boletim-filter-ano">
          <FilterLabel>Ano</FilterLabel>
          <Control
            type="number"
            name="ano"
            value={filters.ano}
            placeholder="Ex.: 2026"
            min="2000"
            inputMode="numeric"
            onChange={handleChange}
          />
        </FilterField>

        <FilterField controlId="boletim-filter-status-fat">
          <FilterLabel>Status Fat.</FilterLabel>
          <Select
            name="statusFaturamento"
            value={filters.statusFaturamento}
            onChange={handleChange}
          >
            <option value="">Todos</option>
            {BOLETIM_FATURAMENTO_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField controlId="boletim-filter-status-pgto">
          <FilterLabel>Status PGTO</FilterLabel>
          <Select
            name="statusPagamento"
            value={filters.statusPagamento}
            onChange={handleChange}
          >
            <option value="">Todos</option>
            {BOLETIM_PAGAMENTO_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
        </FilterField>

        {showValueSort ? (
          <FilterField controlId="boletim-filter-ordem">
            <FilterLabel>Valor BM</FilterLabel>
            <Select
              name="valorTotalBmOrder"
              value={filters.valorTotalBmOrder}
              onChange={handleChange}
            >
              <option value="">Padrao</option>
              {BOLETIM_VALOR_TOTAL_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FilterField>
        ) : null}
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
  grid-template-columns: minmax(230px, 1.25fr) repeat(4, minmax(145px, 1fr));
  gap: 14px;
  align-items: end;

  @media (max-width: 1399.98px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 991.98px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 575.98px) {
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
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 8px;
  background-color: oklch(99% 0.004 240);
  color: oklch(22% 0.018 245);

  ${SearchField} & {
    padding-left: 38px;
  }

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
