import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCopy,
  faExternalLinkAlt,
  faLocationDot,
  faMagnifyingGlass,
  faMap,
} from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

const normalizeText = (value = "") =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getTotalItems = (sections) =>
  sections.reduce((total, section) => total + section.items.length, 0);

const copyToClipboard = async (value) => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch (error) {
      // Some intranet/http contexts expose Clipboard API but block writeText.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
};

export function AddressDirectory({ sections, searchPlaceholder }) {
  const [search, setSearch] = useState("");
  const [openMapKey, setOpenMapKey] = useState();
  const [copiedKey, setCopiedKey] = useState();
  const copyFeedbackTimeout = useRef();
  const totalItems = useMemo(() => getTotalItems(sections), [sections]);
  const normalizedSearch = normalizeText(search.trim());

  const filteredSections = useMemo(() => {
    if (!normalizedSearch) return sections;

    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          const searchableText = normalizeText(
            `${section.title} ${item.title} ${item.endereco}`,
          );

          return searchableText.includes(normalizedSearch);
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [normalizedSearch, sections]);

  const filteredTotalItems = useMemo(
    () => getTotalItems(filteredSections),
    [filteredSections],
  );

  useEffect(() => {
    setOpenMapKey(undefined);
  }, [search]);

  useEffect(
    () => () => {
      window.clearTimeout(copyFeedbackTimeout.current);
    },
    [],
  );

  const handleCopyAddress = async (item) => {
    await copyToClipboard(item.endereco);
    setCopiedKey(item.key);

    window.clearTimeout(copyFeedbackTimeout.current);
    copyFeedbackTimeout.current = window.setTimeout(() => {
      setCopiedKey(undefined);
    }, 1800);
  };

  return (
    <DirectoryShell>
      <DirectoryToolbar>
        <SearchField>
          <SearchIcon icon={faMagnifyingGlass} aria-hidden="true" />
          <SearchInput
            type="search"
            value={search}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            onChange={(event) => setSearch(event.target.value)}
          />
        </SearchField>
        <ResultCount>
          {filteredTotalItems} de {totalItems} endereços
        </ResultCount>
      </DirectoryToolbar>

      {filteredSections.length ? (
        <SectionStack>
          {filteredSections.map((section) => (
            <AddressSection key={section.key || section.title}>
              <SectionHeader>
                <SectionTitle>{section.title}</SectionTitle>
                <SectionCount>{section.items.length}</SectionCount>
              </SectionHeader>
              <AddressGrid>
                {section.items.map((item) => {
                  const isMapOpen = openMapKey === item.key;
                  const isCopied = copiedKey === item.key;
                  const mapPanelId = `address-map-${item.key}`;

                  return (
                    <AddressCard key={item.key}>
                      <CardHeader>
                        <CardIcon aria-hidden="true">
                          <FontAwesomeIcon icon={faLocationDot} />
                        </CardIcon>
                        <CardTitle>{item.title}</CardTitle>
                      </CardHeader>
                      <AddressText>{item.endereco}</AddressText>

                      <ActionRow>
                        <ActionButton
                          type="button"
                          onClick={() => handleCopyAddress(item)}
                        >
                          <FontAwesomeIcon
                            icon={isCopied ? faCheck : faCopy}
                            aria-hidden="true"
                          />
                          {isCopied ? "Copiado" : "Copiar"}
                        </ActionButton>
                        <ActionLink
                          href={item.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FontAwesomeIcon
                            icon={faExternalLinkAlt}
                            aria-hidden="true"
                          />
                          Abrir Maps
                        </ActionLink>
                        <ActionButton
                          type="button"
                          aria-expanded={isMapOpen}
                          aria-controls={mapPanelId}
                          onClick={() =>
                            setOpenMapKey((currentKey) =>
                              currentKey === item.key ? undefined : item.key,
                            )
                          }
                        >
                          <FontAwesomeIcon icon={faMap} aria-hidden="true" />
                          {isMapOpen ? "Ocultar mapa" : "Ver mapa"}
                        </ActionButton>
                      </ActionRow>

                      {isMapOpen ? (
                        <MapFrame
                          id={mapPanelId}
                          src={item.mapUrl}
                          title={`Mapa de ${item.title}`}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      ) : null}
                    </AddressCard>
                  );
                })}
              </AddressGrid>
            </AddressSection>
          ))}
        </SectionStack>
      ) : (
        <EmptyState>Nenhum endereço encontrado para a busca.</EmptyState>
      )}
    </DirectoryShell>
  );
}

const DirectoryShell = styled.div`
  display: grid;
  gap: 1.25rem;
  margin-top: 1.25rem;
`;

const DirectoryToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SearchField = styled.label`
  position: relative;
  flex: 1 1 320px;
  margin: 0;
`;

const SearchIcon = styled(FontAwesomeIcon)`
  position: absolute;
  left: 13px;
  top: 50%;
  color: oklch(50% 0.018 245);
  transform: translateY(-50%);
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  min-height: 44px;
  padding: 0.625rem 0.875rem 0.625rem 2.5rem;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 0.5rem;
  background: oklch(99% 0.004 245);
  color: oklch(26% 0.016 245);

  &:focus {
    border-color: oklch(55% 0.17 253);
    box-shadow: 0 0 0 0.2rem oklch(55% 0.17 253 / 0.14);
    outline: none;
  }
`;

const ResultCount = styled.span`
  color: oklch(46% 0.018 245);
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
`;

const SectionStack = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const AddressSection = styled.section`
  display: grid;
  gap: 0.875rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: oklch(25% 0.016 245);
  font-size: 1rem;
  font-weight: 800;
`;

const SectionCount = styled.span`
  min-width: 28px;
  padding: 0.125rem 0.5rem;
  border: 1px solid oklch(87% 0.012 245);
  border-radius: 999px;
  background: oklch(97% 0.006 245);
  color: oklch(42% 0.018 245);
  font-size: 0.78rem;
  font-weight: 800;
  text-align: center;
`;

const AddressGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;

  @media (min-width: 992px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const AddressCard = styled.article`
  display: grid;
  align-content: start;
  gap: 0.875rem;
  padding: 1rem;
  border: 1px solid oklch(89% 0.009 245);
  border-radius: 8px;
  background: oklch(99% 0.004 245);
  box-shadow: 0 10px 24px oklch(22% 0.018 245 / 0.05);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
`;

const CardIcon = styled.span`
  width: 34px;
  height: 34px;
  min-width: 34px;
  display: inline-grid;
  place-items: center;
  border: 1px solid oklch(88% 0.012 245);
  border-radius: 8px;
  background: oklch(97% 0.006 245);
  color: oklch(42% 0.018 245);
`;

const CardTitle = styled.h3`
  margin: 0;
  color: oklch(23% 0.018 245);
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.25;
`;

const AddressText = styled.p`
  margin: 0;
  color: oklch(35% 0.018 245);
  line-height: 1.5;
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const actionControlStyles = `
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.45rem 0.7rem;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 8px;
  background: oklch(99% 0.004 245);
  color: oklch(34% 0.018 245);
  font: inherit;
  font-size: 0.88rem;
  font-weight: 750;
  line-height: 1.2;
  text-decoration: none;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;

  &:hover,
  &:focus {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
    outline: none;
    text-decoration: none;
  }

  &:focus-visible {
    border-color: oklch(55% 0.17 253);
    box-shadow: 0 0 0 0.2rem oklch(55% 0.17 253 / 0.14);
  }
`;

const ActionButton = styled.button`
  ${actionControlStyles}
`;

const ActionLink = styled.a`
  ${actionControlStyles}
`;

const MapFrame = styled.iframe`
  width: 100%;
  min-height: 280px;
  border: 0;
  border-radius: 8px;
`;

const EmptyState = styled.div`
  padding: 2rem 1rem;
  border: 1px dashed oklch(84% 0.012 245);
  border-radius: 8px;
  background: oklch(98% 0.004 245);
  color: oklch(44% 0.018 245);
  font-weight: 700;
  text-align: center;
`;
