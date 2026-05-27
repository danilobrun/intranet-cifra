import { Container, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";

export const PageContainer = styled(Container)`
  padding-top: 32px;
  padding-bottom: 44px;

  @media (max-width: 575.98px) {
    padding-top: 24px;
    padding-bottom: 32px;
  }
`;

export const IntroSection = styled.section`
  max-width: 920px;
  margin: 0 auto 28px;
  text-align: center;

  @media (max-width: 575.98px) {
    margin-bottom: 22px;
  }
`;

export const PortalTitle = styled.h1`
  margin: 0;
  color: #212529;
  font-size: 1.85rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0;

  @media (min-width: 768px) {
    font-size: 2.25rem;
  }
`;

export const PortalDescription = styled.p`
  margin: 14px auto 0;
  max-width: 900px;
  color: #495057;
  font-size: 1rem;
  line-height: 1.6;

  @media (max-width: 575.98px) {
    font-size: 0.94rem;
    line-height: 1.55;
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  color: #212529;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0;

  @media (max-width: 575.98px) {
    font-size: 1.1rem;
  }
`;

export const SectionIcon = styled(FontAwesomeIcon)`
  color: #6c757d;
  font-size: 1rem;
`;

export const TableCard = styled.section`
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(33, 37, 41, 0.08);
  overflow: hidden;
`;

export const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

export const PortalTable = styled(Table)`
  width: 100%;
  min-width: ${(props) => (props.$wide ? "1040px" : "760px")};
  margin-bottom: 0;
  border-collapse: separate;
  border-spacing: 0;

  thead th {
    background: linear-gradient(180deg, #7b838a 0%, #6c757d 100%);
    color: #ffffff;
    border: 0;
    padding: 0.95rem 0.9rem;
    font-size: 0.86rem;
    font-weight: 700;
    vertical-align: middle;
    white-space: nowrap;
  }

  thead th:first-child {
    border-top-left-radius: 6px;
  }

  thead th:last-child {
    border-top-right-radius: 6px;
  }

  tbody td {
    padding: 1rem 0.9rem;
    color: #343a40;
    border-top: 0;
    border-bottom: 1px solid #edf0f2;
    vertical-align: middle;
    background: #ffffff;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  tbody tr:hover td {
    background: #f8f9fa;
  }

  @media (max-width: 575.98px) {
    min-width: ${(props) => (props.$wide ? "960px" : "680px")};

    thead th,
    tbody td {
      padding: 0.75rem;
      font-size: 0.86rem;
      line-height: 1.35;
    }
  }
`;

export const ColumnTitle = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  line-height: 1.2;
`;

export const HeaderIcon = styled(FontAwesomeIcon)`
  color: #ffffff;
  font-size: 0.85rem;
  opacity: 0.9;
`;

export const LinkIcon = styled(FontAwesomeIcon)`
  font-size: 0.75rem;
`;

export const CellLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  min-width: 36px;
  min-height: 36px;
  padding: 0;
  border: 1px solid #d7e7ff;
  border-radius: 6px;
  background: #f1f7ff;
  color: #0d6efd;
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.2;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    border-color: #b7d5ff;
    background: #e7f1ff;
    color: #0a58ca;
    text-decoration: none;
  }

  &:focus {
    outline: 2px solid rgba(13, 110, 253, 0.28);
    outline-offset: 2px;
  }

  @media (max-width: 575.98px) {
    width: 40px;
    min-width: 40px;
    min-height: 40px;
  }
`;

export const EmptyCell = styled.td`
  color: #6c757d;
  text-align: center;
`;
