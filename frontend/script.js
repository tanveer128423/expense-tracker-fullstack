const API_URL = "http://localhost:5000/expenses";

const messageEl = document.getElementById("message");
const form = document.getElementById("expense-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const expenseList = document.getElementById("expense-list");
const totalEl = document.getElementById("total");


function showMessage(text, color = "green") {
  messageEl.innerText = text;
  messageEl.style.color = color;
  setTimeout(() => {
    messageEl.innerText = "";
  }, 2000);
}


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

  if (
    titleInput.value.trim() === "" ||
    amountInput.value <= 0 ||
    categoryInput.value.trim() === ""
  ) {
    alert("Please enter valid expense details");
    return;
  }

  const expense = {
    title: titleInput.value.trim(),
    amount: Number(amountInput.value),
    category: categoryInput.value.trim(),
  };

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expense),
    });

    form.reset();
    showMessage("Expense added successfully");
    fetchExpenses();
  } catch (error) {
    alert("Error adding expense");
  }
});


async function deleteExpense(id) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    showMessage("Expense deleted", "red");
    fetchExpenses();
  } catch (error) {
    showMessage("Failed to delete expense", "red");
  }
}

