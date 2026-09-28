function Navbar({ userName, onLogout  }) {
  return (
    <nav>
      <h2>Expense Tracker</h2>
      <span>Welcome, {userName}</span>
   
      <button onClick={onLogout}>
        Logout
      </button>
    </nav>
  );
}

export default Navbar;