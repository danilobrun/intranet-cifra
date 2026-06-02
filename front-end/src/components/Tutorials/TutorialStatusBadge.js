import { Badge } from "react-bootstrap";

const statusConfig = {
  rascunho: {
    label: "Rascunho",
    bg: "warning",
    text: "dark",
  },
  publicado: {
    label: "Publicado",
    bg: "success",
  },
  arquivado: {
    label: "Arquivado",
    bg: "secondary",
  },
};

export function TutorialStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.rascunho;

  return (
    <Badge bg={config.bg} text={config.text}>
      {config.label}
    </Badge>
  );
}
