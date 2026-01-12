const API_URL = "http://localhost:5000/expenses";

const form = document.getElementById("expense-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const expenseList = document.getElementById("expense-list");
const totalEl = document.getElementById("total");

async function fetchExpenses() {
  const res = await fetch(API_URL);
  const expenses = await res.json();

  expenseList.innerHTML = "";
  let total = 0;

  expenses.forEach((expense) => {
    total += expense.amount;

    const li = document.createElement("li");
    li.innerHTML = `
      ${expense.title} - ₹${expense.amount}
      <button onclick="deleteExpense('${expense._id}')">X</button>
    `;
    expenseList.appendChild(li);
  });

  totalEl.innerText = total;
}

fetchExpenses();


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const expense = {
    title: titleInput.value,
    amount: Number(amountInput.value),
    category: categoryInput.value,
  };

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });

  form.reset();
  fetchExpenses();
});


async function deleteExpense(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  fetchExpenses();
}
