import { useMemo, useState } from "react";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import {
  EmptyState,
  PortalDescription,
  PortalItem,
  PortalList,
  PortalName,
  PortalText,
  SelectorActions,
  SelectorButton,
  SelectorCounter,
  SelectorHeader,
  SelectorSearch,
  SelectorSearchIcon,
} from "./styles";

export function RolePortalSelector({ portals, selectedPortalIds, onChange }) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();

  const filteredPortals = useMemo(() => {
    if (!normalizedSearch) {
      return portals;
    }

    return portals.filter((portal) => {
      return (
        portal.name?.toLowerCase().includes(normalizedSearch) ||
        portal.shortDescription?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [normalizedSearch, portals]);

  const selectedCount = selectedPortalIds.length;

  const togglePortal = (portalId) => {
    const nextPortalIds = selectedPortalIds.includes(portalId)
      ? selectedPortalIds.filter((selectedPortalId) => selectedPortalId !== portalId)
      : [...selectedPortalIds, portalId];

    onChange(nextPortalIds);
  };

  const selectAllPortals = () => {
    onChange(portals.map((portal) => portal._id));
  };

  const clearPortals = () => {
    onChange([]);
  };

  return (
    <>
      <SelectorHeader>
        <SelectorSearch>
          <SelectorSearchIcon icon={faMagnifyingGlass} />
          <input
            type="text"
            placeholder="Pesquisar portal"
            aria-label="Pesquisar portal"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </SelectorSearch>

        <SelectorActions>
          <SelectorCounter>
            {selectedCount} {selectedCount === 1 ? "portal" : "portais"}{" "}
            selecionado{selectedCount === 1 ? "" : "s"}
          </SelectorCounter>
          <SelectorButton type="button" onClick={selectAllPortals}>
            Marcar todos
          </SelectorButton>
          <SelectorButton type="button" onClick={clearPortals}>
            Limpar
          </SelectorButton>
        </SelectorActions>
      </SelectorHeader>

      <PortalList>
        {filteredPortals.length ? (
          filteredPortals.map((portal) => {
            const portalIsSelected = selectedPortalIds.includes(portal._id);

            return (
              <PortalItem key={portal._id} $selected={portalIsSelected}>
                <input
                  id={`role-portal-${portal._id}`}
                  type="checkbox"
                  checked={portalIsSelected}
                  onChange={() => togglePortal(portal._id)}
                />
                <PortalText htmlFor={`role-portal-${portal._id}`}>
                  <PortalName>{portal.name}</PortalName>
                  {portal.shortDescription ? (
                    <PortalDescription>{portal.shortDescription}</PortalDescription>
                  ) : null}
                </PortalText>
              </PortalItem>
            );
          })
        ) : (
          <EmptyState>Nenhum portal encontrado para esse filtro.</EmptyState>
        )}
      </PortalList>
    </>
  );
}
