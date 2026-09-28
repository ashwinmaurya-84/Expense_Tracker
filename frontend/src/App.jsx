import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./components/Dashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return isLoggedIn ? (
    <Dashboard onLogout={() => setIsLoggedIn(false)} />
  ) : (
    <Login onLogin={() => setIsLoggedIn(true)} />
  );
}

export default App;