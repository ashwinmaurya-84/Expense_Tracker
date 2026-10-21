function Profile({ user, error, onClose }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="panel profile-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-title" onMouseDown={(event) => event.stopPropagation()}><div className="section-heading"><div><p className="eyebrow">Account</p><h2 id="profile-title">Your profile</h2></div><button className="row-action" type="button" onClick={onClose} aria-label="Close profile">Close</button></div>{error ? <p className="error-message">{error}</p> : <dl className="profile-details"><div><dt>Name</dt><dd>{user?.name || "—"}</dd></div><div><dt>Email address</dt><dd>{user?.email || "—"}</dd></div></dl>}</section></div>;
}
export default Profile;
