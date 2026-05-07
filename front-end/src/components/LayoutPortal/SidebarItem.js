import { NavItem, NavLink } from "react-bootstrap";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

export function SidebarItem({ item }) {
  const { pathname } = useResolvedPath(item.to);
  const match = useMatch({ path: pathname, end: item.checkAllPath });
  return (
    <NavItem className="mb-2">
      <NavLink active={match} as={Link} to={item.to} className="text-white">
        {item.text}
      </NavLink>
    </NavItem>
  );
}
