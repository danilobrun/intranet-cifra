import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectUser } from "../../store/User/User.selectors";

// Função para pegar da store se existe sessão de usuário logada.
// Se não tiver usuário logado leva para página de login.
// Caso tenha usuário e não estiver incluido leva para /portal dashboard.
export function PrivateRoute({ children, userTypes }) {
  const user = useSelector(selectUser);
  if (!user) {
    return <Navigate to="/portal/login" />;
  }
  if (userTypes && !userTypes.includes(user.type)) {
    return <Navigate to="/portal" />;
  }
  return children;
}
