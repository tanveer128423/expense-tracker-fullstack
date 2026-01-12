const API_URL = "http://localhost:5000/expenses";

const messageEl = document.getElementById("message");
const form = document.getElementById("expense-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const expenseList = document.getElementById("expense-list");
const totalEl = document.getElementById("total");
const filterCategory = document.getElementById("filter-category");
const filterMonth = document.getElementById("filter-month");
const chartCtx = document.getElementById("expense-chart").getContext("2d");

function showMessage(text, color = "green") {
  messageEl.innerText = text;
  messageEl.style.color = color;
  setTimeout(() => {
    messageEl.innerText = "";
  }, 2000);
}

async function fetchExpenses() {
  try {
    const res = await fetch(API_URL);
    let expenses = await res.json();

    const categories = ["All", ...new Set(expenses.map((e) => e.category))];
    filterCategory.innerHTML = categories
      .map((cat) => `<option value="${cat}">${cat}</option>`)
      .join("");

    if (filterCategory.value !== "All") {
      expenses = expenses.filter((e) => e.category === filterCategory.value);
    }

    if (filterMonth && filterMonth.value) {
      expenses = expenses.filter((e) => e.date.startsWith(filterMonth.value));
    }

    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    expenseList.innerHTML = "";
    let total = 0;

    expenses.forEach((expense) => {
      total += expense.amount;
      const li = document.createElement("li");
      li.innerHTML = `
        ${expense.title} - ₹${expense.amount} (${expense.category})
        <button onclick="deleteExpense('${expense._id}')">X</button>
      `;
      expenseList.appendChild(li);
    });

    totalEl.innerText = total;

    const categoryTotals = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    if (window.expenseChart) window.expenseChart.destroy();
    window.expenseChart = new Chart(chartCtx, {
      type: "pie",
      data: {
        labels: Object.keys(categoryTotals),
        datasets: [{
          label: "Expenses by Category",
          data: Object.values(categoryTotals),
          backgroundColor: [
            "#007bff",
            "#28a745",
            "#ffc107",
            "#dc3545",
            "#6f42c1",
            "#fd7e14"
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });

  } catch (error) {
    showMessage("Failed to load expenses", "red");
  }
}

async function deleteExpense(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    showMessage("Expense deleted", "red");
    fetchExpenses();
  } catch (error) {
    showMessage("Failed to delete expense", "red");
  }
}

filterCategory.addEventListener("change", fetchExpenses);
if (filterMonth) filterMonth.addEventListener("change", fetchExpenses);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = form.querySelector("button");

  if (
    titleInput.value.trim() === "" ||
    amountInput.value <= 0 ||
    categoryInput.value.trim() === "" ||
    dateInput.value === ""
  ) {
    showMessage("Please enter valid expense details", "red");
    return;
  }

  const expense = {
    title: titleInput.value.trim(),
    amount: Number(amountInput.value),
    category: categoryInput.value.trim(),
    date: dateInput.value
  };

  try {
    submitBtn.disabled = true;
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expense),
    });

    form.reset();
    showMessage("Expense added successfully");
    fetchExpenses();
  } catch (error) {
    showMessage("Error adding expense", "red");
  } finally {
    submitBtn.disabled = false;
  }
});

fetchExpenses();
