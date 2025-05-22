document.addEventListener("DOMContentLoaded", () => {
    loadAttendance();
    setupAttendanceForm();
    document.getElementById('attendance-date').addEventListener('change', loadAttendance);
    document.getElementById('attendance-search').addEventListener('input', loadAttendance);
});

async function loadAttendance() {
    const tbody = document.getElementById('attendance-table-body');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Loading attendance...</td></tr>';

    try {
        const [attendanceRes, employeeRes] = await Promise.all([
            fetch('/api/attendance'),
            fetch('/api/employees')
        ]);

        if (!attendanceRes.ok || !employeeRes.ok) {
            throw new Error('Failed to fetch data from one or both endpoints.');
        }

        const [attendanceData, employees] = await Promise.all([
            attendanceRes.json(),
            employeeRes.json()
        ]);

        const employeeMap = {};
        employees.forEach(emp => {
            employeeMap[emp._id] = emp;
        });

        const dateFilter = document.getElementById('attendance-date').value;
        const searchQuery = document.getElementById('attendance-search').value.toLowerCase();

        const filtered = attendanceData.filter(item => {
            const emp = employeeMap[item.employeeId];

            // Date filter
            if (dateFilter) {
                const formatted = new Date(item.date).toISOString().split('T')[0];
                if (formatted !== dateFilter) return false;
            }

            // Search filter
            if (searchQuery) {
                return (
                    item.employeeId.toString().includes(searchQuery) ||
                    (emp?.name && emp.name.toLowerCase().includes(searchQuery))
                );
            }

            return true;
        });

        if (!filtered.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No attendance records found.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        filtered.forEach(item => {
            const emp = employeeMap[item.employeeId] || {};
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item._id}</td>
                <td>${item.employeeId}</td>
                <td>${emp.name || 'Unknown'}</td>
                <td>${emp.department || 'Unknown'}</td>
                <td>${new Date(item.date).toLocaleDateString()}</td>
                <td>${item.status}</td>
                <td>${item.checkIn || '-'}</td>
                <td>${item.checkOut || '-'}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-danger" onclick="deleteAttendance(${item._id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (err) {
        console.error('Error loading attendance:', err);
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-danger">Error loading attendance: ${err.message}</td></tr>`;
    }
}

async function deleteAttendance(id) {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;

    try {
        const res = await fetch(`/api/attendance/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete');

        alert('Attendance deleted successfully.');
        loadAttendance();
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

function setupAttendanceForm() {
    const addBtn = document.getElementById('add-attendance-btn');
    const formContainer = document.getElementById('attendance-form-container');
    const form = document.getElementById('attendance-form');
    const cancelBtn = document.getElementById('cancel-attendance-btn');

    // Show form on "Add Attendance" button click
    addBtn.addEventListener('click', () => {
        formContainer.classList.remove('d-none');
    });

    // Hide form on cancel
    cancelBtn.addEventListener('click', () => {
        form.reset();
        formContainer.classList.add('d-none');
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rawDate = document.getElementById('att-date').value; // e.g. "2025-05-01"
        const formattedDate = rawDate; // since date input returns YYYY-MM-DD already
        console.log(rawDate,formattedDate)
        const data = {
            _id: document.getElementById('att-att-id').value.trim(),
            employeeId: document.getElementById('att-emp-id').value.trim(),
            date: formattedDate,  // just "YYYY-MM-DD"
            status: document.getElementById('att-status').value,
            checkIn: document.getElementById('att-check-in').value || null,
            checkOut: document.getElementById('att-check-out').value || null
        };
        console.log(data)

        try {
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error('Failed to save attendance');

            alert('Attendance saved successfully.');
            form.reset();
            formContainer.classList.add('d-none');
            loadAttendance();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    });
}
