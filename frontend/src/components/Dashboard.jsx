import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ExpenseForm from "./ExpenseForm";
import Navbar from "./Navbar";
import Profile from "./Profile";

const API_URL = import.meta.env.VITE_API_URL;
const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
const displayDate = (value) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));

function Dashboard({ onLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [summaryError, setSummaryError] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [editingExpense, setEditingExpense] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/profile`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        const data = await response.json();
        if (!response.ok) { setProfileError(data.message || "Failed to load your profile."); return; }
        setProfile(data.data.user);
      } catch { setProfileError("Unable to load your profile."); }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        setError("");
        const params = new URLSearchParams({ page: String(page), limit: "10", order: sortOrder });
        if (category) params.append("category", category);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        const response = await fetch(`${API_URL}/expenses?${params.toString()}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        const data = await response.json();
        if (!response.ok) { setError(data.message || "Failed to fetch expenses."); return; }
        setExpenses(data.expenses);
        setPagination(data.pagination);
      } catch { setError("Something went wrong. Please try again."); }
      finally { setLoading(false); }
    };
    fetchExpenses();
  }, [category, startDate, endDate, sortOrder, page]);

  useEffect(() => {
    const controller = new AbortController();
    const loadSummary = async () => {
      try {
        setSummaryError("");
        const response = await fetch(`${API_URL}/expenses/summary/monthly`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, signal: controller.signal });
        const data = await response.json();
        if (!response.ok) { setSummaryError(data.message || "Failed to fetch monthly summary."); return; }
        setMonthlySummary(data.monthly);
      } catch (requestError) { if (requestError.name !== "AbortError") setSummaryError("Failed to fetch monthly summary."); }
    };
    loadSummary();
    return () => controller.abort();
  }, []);

  const totalExpense = expenses.reduce((total, expense) => total + expense.amount, 0);
  const averageExpense = expenses.length ? totalExpense / expenses.length : 0;
  const chartData = monthlySummary.map((item) => ({ month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`, totalExpense: item.totalExpense }));
  const resetPage = (setter) => (event) => { setPage(1); setter(event.target.value); };

  const handleDelete = async (expenseId) => {
    setError("");
    try {
      const response = await fetch(`${API_URL}/expenses/${expenseId}`, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      const data = await response.json();
      if (!response.ok) { setError(data.message || "Failed to delete expense."); return; }
      setExpenses((current) => current.filter((expense) => expense._id !== expenseId));
      if (expenses.length === 1 && page > 1) setPage((current) => current - 1);
    } catch { setError("Unable to connect to the server. Please try again."); }
  };

  const handleExportCsv = async () => {
    try {
      const params = new URLSearchParams({ sortBy: "date", order: sortOrder });
      if (category) params.append("category", category);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const response = await fetch(`${API_URL}/expenses/export?${params.toString()}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      if (!response.ok) throw new Error("Failed to export expenses");
      const url = window.URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url; link.download = "expenses.csv"; link.click(); window.URL.revokeObjectURL(url);
    } catch { setError("Unable to export CSV. Please try again."); }
  };

  return (
    <main className="app-shell">
      <Navbar userName={profile?.name || "there"} onProfile={() => setIsProfileOpen(true)} onLogout={onLogout} />
      {isProfileOpen && <Profile user={profile} error={profileError} onClose={() => setIsProfileOpen(false)} />}
      <section className="page-intro">
        <div><p className="eyebrow">Overview</p><h1>Your spending, at a glance.</h1><p className="intro-copy">Review recent expenses and stay on top of your monthly habits.</p></div>
      </section>

      <section className="panel filter-panel" aria-label="Filter expenses">
        <div className="section-heading"><div><h2>Find expenses</h2><p>Narrow down the records shown below.</p></div></div>
        <div className="filter-grid">
          <div className="field"><label htmlFor="filter-category">Category</label><select id="filter-category" value={category} onChange={resetPage(setCategory)}><option value="">All categories</option><option value="Food">Food</option><option value="Travel">Travel</option><option value="Bills">Bills</option><option value="Shopping">Shopping</option><option value="Other">Other</option></select></div>
          <div className="field"><label htmlFor="filter-from">From date</label><input id="filter-from" type="date" value={startDate} onChange={resetPage(setStartDate)} /></div>
          <div className="field"><label htmlFor="filter-to">To date</label><input id="filter-to" type="date" value={endDate} onChange={resetPage(setEndDate)} /></div>
          <div className="field"><label htmlFor="sort-order">Sort by date</label><select id="sort-order" value={sortOrder} onChange={resetPage(setSortOrder)}><option value="desc">Newest first</option><option value="asc">Oldest first</option></select></div>
          <button className="button button-secondary" onClick={handleExportCsv}>Export CSV</button>
        </div>
      </section>

      <div className="dashboard-grid">
        <div className="main-column">
          <section className="panel chart-panel"><div className="section-heading"><div><h2>Monthly spending</h2><p>Expense total by month.</p></div></div>{summaryError && <p className="error-message">{summaryError}</p>}{monthlySummary.length ? <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 5, right: 4, left: -18, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e3ebe6" /><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#66746e", fontSize: 12 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#66746e", fontSize: 12 }} /><Tooltip cursor={{ fill: "#f1f5f3" }} formatter={(value) => currency.format(value)} /><Bar dataKey="totalExpense" name="Total expense" fill="#176b59" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div> : <p className="empty-state">No monthly expense data available yet.</p>}</section>
          <section className="panel expenses-panel"><div className="section-heading"><div><h2>Recent expenses</h2><p>{pagination?.total ?? expenses.length} record{(pagination?.total ?? expenses.length) === 1 ? "" : "s"} found</p></div></div>{loading && <p className="status-message">Loading expenses…</p>}{error && <p className="error-message">{error}</p>}{!loading && !error && (expenses.length ? <div className="expense-list">{expenses.map((expense) => <article className="expense-row" key={expense._id}><div><h3 className="expense-title">{expense.title}</h3><span className="expense-date">{displayDate(expense.date)}</span></div><div className="expense-amount"><span className="mobile-label">Amount</span>{currency.format(expense.amount)}</div><div className="expense-category"><span className="mobile-label">Category</span><span className="category-tag">{expense.category}</span></div><div className="row-actions"><button className="row-action" onClick={() => setEditingExpense(expense)}>Edit</button><button className="row-action delete" onClick={() => handleDelete(expense._id)}>Delete</button></div></article>)}</div> : <p className="empty-state">No expenses match these filters.</p>)}{pagination && pagination.totalPages > 1 && <nav className="pagination" aria-label="Expense pagination"><button className="button button-secondary" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button><span>Page {pagination.page} of {pagination.totalPages}</span><button className="button button-secondary" disabled={page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)}>Next</button></nav>}</section>
        </div>
        <aside className="side-column">
          <section className="summary-grid" aria-label="Expense summary"><article className="summary-card"><span className="label">This page total</span><strong>{currency.format(totalExpense)}</strong></article><article className="summary-card"><span className="label">Expenses shown</span><strong>{expenses.length}</strong></article><article className="summary-card"><span className="label">Average expense</span><strong>{currency.format(averageExpense)}</strong></article></section>
          <ExpenseForm key={editingExpense?._id ?? "new-expense"} expense={editingExpense} onCancel={() => setEditingExpense(null)} onExpenseAdded={(savedExpense) => { setExpenses((current) => editingExpense ? current.map((expense) => expense._id === savedExpense._id ? savedExpense : expense) : [savedExpense, ...current]); setEditingExpense(null); }} />
        </aside>
      </div>
    </main>
  );
}

export default Dashboard;
