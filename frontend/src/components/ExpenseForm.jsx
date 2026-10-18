import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function ExpenseForm({ expense, onExpenseAdded }) {
  const [title, setTitle] = useState(expense?.title ?? "");
  const [amount, setAmount] = useState(
    expense ? String(expense.amount) : ""
  );
  const [category, setCategory] = useState(expense?.category ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const url = expense
        ? `${API_URL}/expenses/${expense._id}`
        : `${API_URL}/expenses`;

      const method = expense ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          amount: Number(amount),
          category,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to save expense.");
        return;
      }

      onExpenseAdded(data.expense);

      setTitle("");
      setAmount("");
      setCategory("");
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{expense ? "Edit Expense" : "Add Expense"}</h2>

      {error && <p>{error}</p>}

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />

      <input
        type="number"
        min="0.01"
        step="0.01"
        placeholder="Amount"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        required
      />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? expense
            ? "Updating..."
            : "Adding..."
          : expense
            ? "Update Expense"
            : "Add Expense"}
      </button>
    </form>
  );
}

export default ExpenseForm;