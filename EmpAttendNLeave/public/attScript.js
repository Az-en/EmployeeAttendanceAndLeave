document.addEventListener("DOMContentLoaded", () => {
    loadAttendance();
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
                <td>${item.employeeId}</td>
                <td>${emp.name || 'Unknown'}</td>
                <td>${emp.department || 'Unknown'}</td>
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
