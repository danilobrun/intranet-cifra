import { Button } from "react-bootstrap";
import styled from "styled-components";

export function PaginationControls({ pagination, isLoading, onPageChange }) {
  const page = Number(pagination?.page || 1);
  const totalPages = Number(pagination?.totalPages || 0);
  const total = Number(pagination?.total || 0);
  const limit = Number(pagination?.limit || 50);
  const hasPreviousPage = page > 1;
  const hasNextPage = totalPages > 0 && page < totalPages;
  const firstItem = total ? (page - 1) * limit + 1 : 0;
  const lastItem = total ? Math.min(page * limit, total) : 0;

  return (
    <PaginationBar>
      <PaginationInfo>
        {total
          ? `Mostrando ${firstItem} a ${lastItem} de ${total} funcionário(s)`
          : "Nenhum funcionário para paginar"}
      </PaginationInfo>

      <PaginationActions>
        <PaginationButton
          type="button"
          variant="light"
          disabled={isLoading || !hasPreviousPage}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </PaginationButton>
        <PageIndicator>
          Página {totalPages ? page : 0} de {totalPages}
        </PageIndicator>
        <PaginationButton
          type="button"
          variant="light"
          disabled={isLoading || !hasNextPage}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
        </PaginationButton>
      </PaginationActions>
    </PaginationBar>
  );
}

const PaginationBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 14px;
`;

const PaginationInfo = styled.span`
  color: oklch(49% 0.018 245);
  font-size: 0.9rem;
  font-weight: 650;
`;

const PaginationActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  @media (max-width: 575.98px) {
    width: 100%;
  }
`;

const PaginationButton = styled(Button)`
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid oklch(86% 0.012 245);
  border-radius: 9px;
  background: oklch(99% 0.004 245);
  color: oklch(31% 0.018 245);
  font-weight: 700;

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    border-color: oklch(78% 0.018 245);
    background: oklch(96% 0.006 245);
    color: oklch(22% 0.018 245);
  }

  @media (max-width: 575.98px) {
    flex: 1 1 120px;
  }
`;

const PageIndicator = styled.span`
  color: oklch(31% 0.018 245);
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
`;
