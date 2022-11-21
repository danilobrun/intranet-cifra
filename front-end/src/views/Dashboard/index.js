import { Alert, Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { LayoutPortal } from "../../components/LayoutPortal";
import { selectUser } from "../../store/User/User.selectors";

export function DashboardView() {
  const user = useSelector(selectUser);
  return (
    <LayoutPortal>
      <h1 className="mt-4">Bem vindo(a) {user.name}!</h1>
      {user.type === 1 ? (
        <>
          <p>Utilize o menu para gerenciar os dados do site.</p>
          <Button as={Link} to="/portals" className="text-uppercase">
            Acessar
          </Button>
        </>
      ) : (
        <>
          <Alert variant="info">
            Você receberá as intruções das solicitações aos portais por e-mail.
          </Alert>
          <Button as={Link} to="/portals" className="text-uppercase">
            Acessar
          </Button>
        </>
      )}
    </LayoutPortal>
  );
}
