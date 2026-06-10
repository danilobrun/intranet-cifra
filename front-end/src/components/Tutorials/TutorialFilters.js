import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

const statusFilters = [
  { value: "todos", label: "Todos" },
  { value: "publicado", label: "Publicados" },
  { value: "rascunho", label: "Rascunhos" },
  { value: "arquivado", label: "Arquivados" },
];

const getCounterLabel = (count, isLoading) => {
  if (isLoading) {
    return "Carregando tutoriais";
  }

  if (count === 1) {
    return "1 tutorial encontrado";
  }

  return `${count} tutoriais encontrados`;
};

export function TutorialFilters({
  count,
  isAdmin,
  isLoading,
  search,
  status,
  onSearchChange,
  onStatusChange,
}) {
  return (
    <FiltersToolbar>
      <SearchField>
        <SearchIcon icon={faMagnifyingGlass} />
        <SearchInput
          type="text"
          placeholder="Pesquisar tutorial"
          aria-label="Pesquisar tutorial"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </SearchField>

      {isAdmin ? (
        <StatusFilters aria-label="Filtrar tutoriais por status">
          {statusFilters.map((filter) => (
            <StatusChip
              key={filter.value}
              type="button"
              $active={status === filter.value}
              onClick={() => onStatusChange(filter.value)}
            >
              {filter.label}
            </StatusChip>
          ))}
        </StatusFilters>
      ) : null}

      <CounterPill>{getCounterLabel(count, isLoading)}</CounterPill>
    </FiltersToolbar>
  );
}

const FiltersToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  margin: 0 0 22px;
  padding: 12px;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 12px;
  background: oklch(99% 0.004 245);
  box-shadow: 0 10px 24px oklch(22% 0.018 245 / 0.05);
  flex-wrap: wrap;
`;

const SearchField = styled.div`
  position: relative;
  width: min(420px, 100%);
  flex: 0 1 420px;
`;

const SearchIcon = styled(FontAwesomeIcon)`
  position: absolute;
  top: 50%;
  left: 16px;
  color: oklch(49% 0.018 245);
  font-size: 0.9rem;
  pointer-events: none;
  transform: translateY(-50%);
`;

const SearchInput = styled.input`
  width: 100%;
  min-height: 42px;
  padding: 9px 16px 9px 42px;
  border: 1px solid oklch(87% 0.014 245);
  border-radius: 10px;
  background: oklch(99% 0.004 240);
  color: oklch(22% 0.018 245);
  font-size: 0.98rem;
  outline: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;

  &::placeholder {
    color: oklch(58% 0.018 245);
  }

  &:focus {
    border-color: oklch(55% 0.17 253);
    background: oklch(99.2% 0.004 240);
    box-shadow: 0 0 0 0.2rem oklch(55% 0.17 253 / 0.12);
  }
`;

const StatusFilters = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  flex: 0 1 auto;
  flex-wrap: wrap;

  @media (max-width: 767.98px) {
    justify-content: flex-start;
  }
`;

const StatusChip = styled.button`
  min-height: 36px;
  padding: 0 13px;
  border: 1px solid
    ${({ $active }) =>
      $active ? "oklch(79% 0.07 253)" : "oklch(87% 0.014 245)"};
  border-radius: 999px;
  background: ${({ $active }) =>
    $active ? "oklch(97% 0.018 253)" : "oklch(99% 0.004 245)"};
  color: ${({ $active }) =>
    $active ? "oklch(39% 0.12 253)" : "oklch(38% 0.018 245)"};
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease;

  &:hover,
  &:focus {
    border-color: oklch(72% 0.08 253);
    background: oklch(97% 0.018 253);
    color: oklch(39% 0.12 253);
    outline: none;
  }
`;

const CounterPill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  margin-left: auto;
  padding: 0 13px;
  border: 1px solid oklch(86% 0.028 253);
  border-radius: 999px;
  background: oklch(97% 0.018 253);
  color: oklch(39% 0.12 253);
  font-size: 0.9rem;
  font-weight: 760;
  white-space: nowrap;

  @media (max-width: 767.98px) {
    margin-left: 0;
  }
`;
