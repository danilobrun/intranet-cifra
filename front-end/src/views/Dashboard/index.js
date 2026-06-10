import { useSelector } from "react-redux";
import styled from "styled-components";
import { DashboardWelcomeHeader } from "../../components/Dashboard/WelcomeHeader";
import { DashboardWeatherPanel } from "../../components/Dashboard/WeatherPanel";
import { LayoutPortal } from "../../components/LayoutPortal";
import { selectUser } from "../../store/User/User.selectors";

export function DashboardView() {
  const user = useSelector(selectUser);
  const userName = user?.name || "Usuário";

  return (
    <LayoutPortal>
      <PageSection>
        <DashboardWelcomeHeader userName={userName} />
        <DashboardWeatherPanel />
      </PageSection>
    </LayoutPortal>
  );
}

const PageSection = styled.section`
  width: 100%;
  min-height: calc(100vh - 72px);
  padding: 1.5rem 0 2rem;
`;
