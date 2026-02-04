import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUserStore } from "../modules/auth/current-user.state";

const AuthGuard = () => {
  const { currentUser } = useCurrentUserStore();
  if (!currentUser) return <Navigate to="/login" />;
  return <Outlet />;
};

export default AuthGuard;
