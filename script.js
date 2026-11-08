
const jobForm = document.getElementById("jobForm");
const jobList = document.getElementById("jobList");
const searchInput = document.getElementById("search");

// Load saved applications
let jobs = JSON.parse(localStorage.getItem("jobs")) || [];

// Save applications in browser storage
function saveJobs() {
    localStorage.setItem("jobs", JSON.stringify(jobs));
}

// Display applications
function displayJobs() {
    jobList.innerHTML = "";

    const searchText = searchInput.value.toLowerCase();

    jobs.forEach(function(job, index) {

        // Search by company name or job role
        if (
            !job.company.toLowerCase().includes(searchText) &&
            !job.role.toLowerCase().includes(searchText)
        ) {
            return;
        }

        const row = document.createElement("tr");

        // Create table cells
        [job.company, job.role, job.date, job.status].forEach(function(value, cellIndex) {
    const cell = document.createElement("td");
    cell.textContent = value;

    // Add color to status
    if (cellIndex === 3) {
        cell.classList.add("status", job.status.toLowerCase());
    }

    row.appendChild(cell);
});

        const actionCell = document.createElement("td");

        // Edit button
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";

        editButton.addEventListener("click", function() {

            const company = prompt("Company name:", job.company);
            if (company === null || !company.trim()) return;

            const role = prompt("Job role:", job.role);
            if (role === null || !role.trim()) return;

            const date = prompt("Application date (YYYY-MM-DD):", job.date);
            if (date === null || !date.trim()) return;

            const status = prompt(
                "Status (Applied, Interview, Selected):",
                job.status
            );

            if (status === null) return;

            if (!["Applied", "Interview", "Selected"].includes(status.trim())) {
                alert("Please enter Applied, Interview, or Selected.");
                return;
            }

            jobs[index] = {
                company: company.trim(),
                role: role.trim(),
                date: date.trim(),
                status: status.trim()
            };

            saveJobs();
            displayJobs();
        });

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function() {

            const confirmDelete = confirm("Are you sure you want to delete this application?");

            if (confirmDelete) {
                jobs.splice(index, 1);
                saveJobs();
                displayJobs();
            }
        });

        actionCell.append(editButton, deleteButton);
        row.appendChild(actionCell);
        jobList.appendChild(row);
    });

    updateStatistics();
}

// Add new application
jobForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const company = document.getElementById("company").value.trim();
    const role = document.getElementById("role").value.trim();
    const date = document.getElementById("date").value;
    const status = document.getElementById("status").value;

    jobs.push({
        company: company,
        role: role,
        date: date,
        status: status
    });

    saveJobs();
    displayJobs();

    jobForm.reset();
});

// Update dashboard statistics
function updateStatistics() {

    document.getElementById("totalCount").textContent = jobs.length;

    document.getElementById("appliedCount").textContent =
        jobs.filter(job => job.status === "Applied").length;

    document.getElementById("interviewCount").textContent =
        jobs.filter(job => job.status === "Interview").length;

    document.getElementById("selectedCount").textContent =
        jobs.filter(job => job.status === "Selected").length;
}

// Calculate chart percentages
const total = jobs.length;

const appliedPercent = total
    ? jobs.filter(job => job.status === "Applied").length / total * 100
    : 0;

const interviewPercent = total
    ? jobs.filter(job => job.status === "Interview").length / total * 100
    : 0;

const selectedPercent = total
    ? jobs.filter(job => job.status === "Selected").length / total * 100
    : 0;

// Update chart bars
document.getElementById("appliedBar").style.width =
    appliedPercent + "%";

document.getElementById("interviewBar").style.width =
    interviewPercent + "%";

document.getElementById("selectedBar").style.width =
    selectedPercent + "%";

// Display percentages
document.getElementById("appliedPercentage").textContent =
    Math.round(appliedPercent) + "%";

document.getElementById("interviewPercentage").textContent =
    Math.round(interviewPercent) + "%";

document.getElementById("selectedPercentage").textContent =
    Math.round(selectedPercent) + "%";

// Search applications
searchInput.addEventListener("input", displayJobs);


// Export applications to CSV
document.getElementById("exportBtn").addEventListener("click", function() {

    if (jobs.length === 0) {
        alert("No applications available to export!");
        return;
    }

    const headers = ["Company", "Job Role", "Date", "Status"];

    const csvRows = jobs.map(function(job) {
        return [job.company, job.role, job.date, job.status]
            .map(value => '"' + String(value).replace(/"/g, '""') + '"')
            .join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "job-applications.csv";
    link.click();

    URL.revokeObjectURL(url);
});

// Display saved applications when page opens
displayJobs();
