import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;
const today = new Date().toISOString().slice(0, 10);

function ExpenseForm({ expense, onExpenseAdded, onCancel }) {
  const [title, setTitle] = useState(expense?.title ?? "");
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [category, setCategory] = useState(expense?.category ?? "");
  const [date, setDate] = useState(expense?.date?.slice(0, 10) ?? today);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const url = expense ? `${API_URL}/expenses/${expense._id}` : `${API_URL}/expenses`;
      const response = await fetch(url, {
        method: expense ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, amount: Number(amount), category, date }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to save expense.");
        return;
      }

      onExpenseAdded(data.expense);
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel form-panel">
      <div className="section-heading">
        <div>
          <h2>{expense ? "Edit expense" : "Add an expense"}</h2>
          <p>{expense ? "Update the details below." : "Keep your spending records current."}</p>
        </div>
      </div>
      <form className="expense-form" onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}
        <div className="field">
          <label htmlFor="expense-title">Description</label>
          <input id="expense-title" type="text" placeholder="e.g. Team lunch" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="expense-amount">Amount</label>
            <input id="expense-amount" type="number" min="0.01" step="0.01" placeholder="0.00" value={amount} onChange={(event) => setAmount(event.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="expense-category">Category</label>
            <input id="expense-category" list="categories" placeholder="e.g. Food" value={category} onChange={(event) => setCategory(event.target.value)} required />
            <datalist id="categories"><option value="Food" /><option value="Travel" /><option value="Bills" /><option value="Shopping" /><option value="Other" /></datalist>
          </div>
        </div>
        <div className="field">
          <label htmlFor="expense-date">Date</label>
          <input id="expense-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
        </div>
        <div className="form-actions">
          <button className="button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : expense ? "Save changes" : "Add expense"}</button>
          {expense && <button className="button button-secondary" type="button" onClick={onCancel}>Cancel</button>}
        </div>
      </form>
    </section>
  );
}

export default ExpenseForm;
