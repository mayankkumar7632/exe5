const form = document.getElementById("employeeForm");
const tableBody = document.getElementById("tableBody");
const countBadge = document.getElementById("count");
const emptyMsg = document.getElementById("emptyMsg");
const alertBox = document.getElementById("alert");
const submitBtn = document.getElementById("submitBtn");


// ===============================
// DATE OF JOINING
// ===============================

const dateOfJoining = document.getElementById("dateOfJoining");

if (dateOfJoining) {
    dateOfJoining.max = new Date().toISOString().split("T")[0];
}


// ===============================
// ESCAPE HTML
// ===============================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


// ===============================
// SHOW ALERT
// ===============================

function showAlert(message, type) {

    alertBox.textContent = message;

    alertBox.className = `alert ${type}`;

    setTimeout(() => {
        alertBox.className = "alert hidden";
    }, 3500);
}


// ===============================
// FORMAT SALARY
// ===============================

function formatSalary(value) {

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0
    }).format(value);
}


// ===============================
// FORMAT DATE
// ===============================

function formatDate(value) {

    if (!value) {
        return "-";
    }

    const d = new Date(value);

    if (isNaN(d)) {
        return "-";
    }

    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
    });
}


// ===============================
// DISPLAY EMPLOYEES
// ===============================

function renderTable(employees) {

    tableBody.innerHTML = "";

    countBadge.textContent = employees.length;

    emptyMsg.classList.toggle(
        "hidden",
        employees.length > 0
    );


    employees.forEach((emp) => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${escapeHtml(emp.name)}</td>
            <td>${escapeHtml(emp.email)}</td>
            <td>${escapeHtml(emp.phone)}</td>
            <td>${escapeHtml(emp.department)}</td>
            <td>${escapeHtml(emp.position)}</td>
            <td>${formatSalary(emp.salary)}</td>
            <td>${formatDate(emp.dateOfJoining)}</td>

            <td>
                <button
                    class="btn-delete"
                    data-id="${escapeHtml(emp._id)}">
                    Delete
                </button>
            </td>
        `;

        tableBody.appendChild(tr);
    });
}


// ===============================
// LOAD EMPLOYEES
// ===============================

async function loadEmployees() {

    try {

        const res = await fetch("/api/employees");

        const text = await res.text();

        console.log("GET response:", text);


        if (!res.ok) {

            throw new Error(
                `Failed to load employees (${res.status})`
            );
        }


        if (!text) {

            throw new Error(
                "Server returned an empty response"
            );
        }


        const data = JSON.parse(text);

        renderTable(data);


    } catch (err) {

        console.error("Load employees error:", err);

        showAlert(err.message, "error");
    }
}


// ===============================
// DELETE EMPLOYEE
// ===============================

tableBody.addEventListener("click", async (e) => {

    if (!e.target.classList.contains("btn-delete")) {
        return;
    }


    if (!confirm("Delete this employee?")) {
        return;
    }


    const id = e.target.dataset.id;


    try {

        const res = await fetch(
            `/api/employees/${id}`,
            {
                method: "DELETE"
            }
        );


        const text = await res.text();

        console.log("DELETE response:", text);


        if (!text) {
            throw new Error("Server returned an empty response");
        }


        const data = JSON.parse(text);


        if (!res.ok) {
            throw new Error(
                data.error || "Delete failed"
            );
        }


        showAlert(
            "Employee deleted successfully",
            "success"
        );


        loadEmployees();


    } catch (err) {

        console.error("Delete error:", err);

        showAlert(
            err.message,
            "error"
        );
    }
});


// ===============================
// ADD EMPLOYEE
// ===============================

form.addEventListener("submit", async (e) => {

    e.preventDefault();


    const payload = {

        name: form.name.value.trim(),

        email: form.email.value.trim(),

        phone: form.phone.value.trim(),

        department: form.department.value,

        position: form.position.value.trim(),

        salary: parseFloat(form.salary.value),

        dateOfJoining: form.dateOfJoining.value

    };


    console.log("Sending employee:", payload);


    submitBtn.disabled = true;

    submitBtn.textContent = "Saving...";


    try {

        const res = await fetch(
            "/api/employees",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)
            }
        );


        // Get response as text first
        const text = await res.text();


        console.log(
            "POST status:",
            res.status
        );

        console.log(
            "POST response:",
            text
        );


        // Check empty response
        if (!text) {

            throw new Error(
                "Server returned an empty response"
            );
        }


        // Convert response to JSON
        const data = JSON.parse(text);


        if (!res.ok) {

            throw new Error(
                data.error || "Something went wrong"
            );
        }


        showAlert(
            data.message,
            "success"
        );


        form.reset();


        loadEmployees();


    } catch (err) {

        console.error(
            "Add employee error:",
            err
        );


        showAlert(
            err.message,
            "error"
        );


    } finally {

        submitBtn.disabled = false;

        submitBtn.textContent = "Save Employee";
    }

});


// ===============================
// INITIAL LOAD
// ===============================

loadEmployees();