import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectUser } from "../../store/User/User.selectors";

// Função para pegar da store se existe sessão de usuário logada.
// Se não tiver usuário logado leva para página de login.
// Caso tenha usuário e não estiver incluido leva para /portal dashboard.
export function PrivateRoute({ children, userTypes, canAccess }) {
  const user = useSelector(selectUser);
  if (!user) {
    return <Navigate to="/" />;
  }
  if (canAccess && !canAccess(user)) {
    return <Navigate to="/portal" />;
  }
  if (userTypes && !userTypes.includes(user.roles[0].code)) {
    return <Navigate to="/portal" />;
  }
  return children;
}
