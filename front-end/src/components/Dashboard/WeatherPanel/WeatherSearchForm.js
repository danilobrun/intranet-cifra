import { Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationCrosshairs,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

export function WeatherSearchForm({
  searchTerm,
  onSearchTermChange,
  onSearch,
  onUseCurrentLocation,
  isSearching,
  isDetectingLocation,
}) {
  const isBusy = isSearching || isDetectingLocation;

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <SearchArea>
      <SearchForm onSubmit={handleSubmit}>
        <SearchInput
          type="search"
          name="city"
          value={searchTerm}
          placeholder="Pesquisar cidade do Brasil"
          aria-label="Pesquisar cidade do Brasil"
          disabled={isBusy}
          onChange={(event) => onSearchTermChange(event.target.value)}
        />
        <SearchButton type="submit" disabled={isBusy}>
          <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
          <span>{isSearching ? "Buscando..." : "Buscar"}</span>
        </SearchButton>
      </SearchForm>

      <LocationButton
        type="button"
        variant="link"
        disabled={isBusy}
        onClick={onUseCurrentLocation}
      >
        <FontAwesomeIcon icon={faLocationCrosshairs} aria-hidden="true" />
        <span>
          {isDetectingLocation ? "Localizando..." : "Usar minha localização"}
        </span>
      </LocationButton>
    </SearchArea>
  );
}

const SearchArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;

  @media (max-width: 767px) {
    width: 100%;
    justify-content: stretch;
  }
`;

const SearchForm = styled(Form)`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 575px) {
    width: 100%;
    align-items: stretch;
    flex-direction: column;
  }
`;

const SearchInput = styled(Form.Control)`
  width: min(19rem, 52vw);
  min-height: 42px;
  border-color: oklch(86% 0.012 245);
  border-radius: 0.375rem;
  color: oklch(24% 0.018 245);

  &:focus {
    border-color: oklch(55% 0.17 253);
    box-shadow: 0 0 0 0.2rem oklch(55% 0.17 253 / 0.14);
  }

  @media (max-width: 575px) {
    width: 100%;
  }
`;

const SearchButton = styled(Button)`
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.375rem;
  white-space: nowrap;
`;

const LocationButton = styled(Button)`
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.375rem 0.25rem;
  color: oklch(45% 0.16 253);
  font-weight: 600;
  text-decoration: none;

  &:hover,
  &:focus {
    color: oklch(38% 0.17 253);
    text-decoration: underline;
  }

  &:disabled {
    color: oklch(58% 0.014 245);
    text-decoration: none;
  }

  @media (max-width: 575px) {
    width: 100%;
  }
`;
