import { useEffect, useState } from "react";
import ExpenseForm from "./ExpenseForm";
import Navbar from "./Navbar";

function Dashboard({ onLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const [editingExpense, setEditingExpense] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const params = new URLSearchParams();

        if (category) {
          params.append("category", category);
        }

        if (startDate) {
          params.append("startDate", startDate);
        }

        if (endDate) {
          params.append("endDate", endDate);
        }

        if (sortOrder) {
          params.append("order", sortOrder);
        }

        params.append("page", page);
        params.append("limit", 10);

        const query = params.toString()
          ? `?${params.toString()}`
          : "";

        const response = await fetch(
          `http://localhost:5000/expenses${query}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to fetch expenses.");
          return;
        }

        setExpenses(data.expenses);

        // Save pagination information
        setPagination(data.pagination);
      } catch (error) {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [category, startDate, endDate, sortOrder, page]);

  // Reset to page 1 whenever filters/sorting change
  useEffect(() => {
    setPage(1);
  }, [category, startDate, endDate, sortOrder]);

  const totalExpense = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  const expenseCount = expenses.length;

  const averageExpense =
    expenseCount === 0 ? 0 : totalExpense / expenseCount;

  const handleEdit = (expense) => {
    setEditingExpense(expense);
  };

  const handleDelete = async (expenseId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/expenses/${expenseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data.message);
        return;
      }

      setExpenses((currentExpenses) =>
        currentExpenses.filter(
          (expense) => expense._id !== expenseId
        )
      );
    } catch (error) {
      console.error("Delete expense error:", error);
    }
  };

  const handleExportCsv = async () => {
    try {
      const params = new URLSearchParams();

      if (category) params.append("category", category);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      params.append("sortBy", "date");
      params.append("order", sortOrder);

      const response = await fetch(
        `http://localhost:5000/expenses/export?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to export expenses");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "expenses.csv";
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <main>
      <Navbar
        userName="Ashwin"
        onLogout={onLogout}
      />

      <h1>Dashboard</h1>

      <section>
        <h2>Filter Expenses</h2>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Bills">Bills</option>
          <option value="Shopping">Shopping</option>
          <option value="Other">Other</option>
        </select>
      </section>

      <button onClick={handleExportCsv}>
        Export CSV
      </button>

      <label>
        From:
        <input
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
      </label>

      <label>
        To:
        <input
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />
      </label>

      <select
        value={sortOrder}
        onChange={(event) => setSortOrder(event.target.value)}
      >
        <option value="desc">Newest First</option>
        <option value="asc">Oldest First</option>
      </select>

      <section>
        <h2>Summary</h2>

        <p>Total Expenses: ₹{totalExpense}</p>
        <p>Number of Expenses: {expenseCount}</p>
        <p>Average Expense: ₹{averageExpense.toFixed(2)}</p>
      </section>

      <ExpenseForm
        expense={editingExpense}
        onExpenseAdded={(savedExpense) => {
          setExpenses((currentExpenses) => {
            if (!editingExpense) {
              return [savedExpense, ...currentExpenses];
            }

            return currentExpenses.map((expense) =>
              expense._id === savedExpense._id
                ? savedExpense
                : expense
            );
          });

          setEditingExpense(null);
        }}
      />

      {loading && <p>Loading expenses...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <section>
          <h2>Expenses</h2>

          {expenses.length === 0 ? (
            <p>No expenses found.</p>
          ) : (
            expenses.map((expense) => (
              <div key={expense._id}>
                <h3>{expense.title}</h3>
                <p>₹{expense.amount}</p>
                <p>{expense.category}</p>

                <button onClick={() => handleEdit(expense)}>
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(expense._id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </section>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <section>
          <button
            disabled={page <= 1}
            onClick={() =>
              setPage((current) => current - 1)
            }
          >
            Previous
          </button>

          <span>
            {" "}
            Page {pagination.page} of {pagination.totalPages}{" "}
          </span>

          <button
            disabled={page >= pagination.totalPages}
            onClick={() =>
              setPage((current) => current + 1)
            }
          >
            Next
          </button>
        </section>
      )}
    </main>
  );
}

export default Dashboard;