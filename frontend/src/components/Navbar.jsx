function Navbar({ userName, onProfile, onLogout }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">₹</span>
        <span>Expense Tracker</span>
      </div>
      <div className="account-actions">
        <span className="welcome">Welcome back, {userName}</span>
        <button className="button button-quiet" onClick={onProfile}>Profile</button>
        <button className="button button-quiet" onClick={onLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}

export default Navbar;
