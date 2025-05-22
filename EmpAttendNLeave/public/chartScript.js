document.addEventListener('DOMContentLoaded',function () {
    // Chart Functions
    function initCharts() {
        // Attendance Chart (Bar Chart)
        const attendanceCtx = document.getElementById('attendance-chart').getContext('2d');
        window.attendanceChart = new Chart(attendanceCtx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Present',
                    data: [12, 15, 13, 14, 16, 8, 5],
                    backgroundColor: '#1cc88a',
                    borderColor: '#1cc88a',
                    borderWidth: 1
                }, {
                    label: 'Absent',
                    data: [2, 1, 3, 2, 0, 1, 0],
                    backgroundColor: '#e74a3b',
                    borderColor: '#e74a3b',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: {
                        display: true,
                        text: 'Weekly Attendance',
                        font: { size: 16 }
                    }
                }
            }
        });

        // Leave Chart (Pie Chart)
        const leaveCtx = document.getElementById('leave-chart').getContext('2d');
        window.leaveChart = new Chart(leaveCtx, {
            type: 'pie',
            data: {
                labels: ['Sick Leave', 'Vacation', 'Personal', 'Maternity', 'Bereavement'],
                datasets: [{
                    data: [15, 10, 5, 3, 2],
                    backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: {
                        display: true,
                        text: 'Leave Distribution',
                        font: { size: 16 }
                    }
                }
            }
        });
    }

    function getChartOptions(title) {
        return {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: {
                    display: true,
                    text: title,
                    font: { size: 16 }
                }
            }
        };
    }

    async function updateCharts() {
        try {
            // Fetch data from backend APIs
            const [employeesRes, attendanceRes, leaveRes] = await Promise.all([
                fetch('/api/employees'),
                fetch('/api/attendance'),
                fetch('/api/leaves')
            ]);

            if (!employeesRes.ok || !attendanceRes.ok || !leaveRes.ok) {
                throw new Error('Failed to fetch data from API');
            }

            const employees = await employeesRes.json();
            const attendanceRecords = await attendanceRes.json();
            const leaveRequests = await leaveRes.json();

            // Update charts with fetched data
            updateAttendanceChart(attendanceRecords);
            updateLeaveChart(leaveRequests);
        } catch (error) {
            console.error('Error updating charts:', error);
            showNotification('Error', 'Failed to load chart data from server.', 'error');
        }
    }

    function updateAttendanceChart(attendanceRecords) {
        // Group records by date and count statuses
        const recordsByDate = {};

        attendanceRecords.forEach(rec => {
            const dateStr = new Date(rec.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });

            if (!recordsByDate[dateStr]) {
                recordsByDate[dateStr] = {
                    present: 0,
                    absent: 0,
                    leave: 0
                };
            }

            // Count by status
            switch (rec.status) {
                case 'Present':
                    recordsByDate[dateStr].present++;
                    break;
                case 'Absent':
                    recordsByDate[dateStr].absent++;
                    break;
                case 'Leave':
                    recordsByDate[dateStr].leave++;
                    break;
            }
        });

        // Prepare chart data
        const dates = Object.keys(recordsByDate);
        const presentData = dates.map(date => recordsByDate[date].present);
        const absentData = dates.map(date => recordsByDate[date].absent);
        const leaveData = dates.map(date => recordsByDate[date].leave);

        // Update chart
        window.attendanceChart.data.labels = dates;
        window.attendanceChart.data.datasets = [
            {
                label: 'Present',
                data: presentData,
                backgroundColor: '#1cc88a', // Green
                borderColor: '#1cc88a',
                borderWidth: 1
            },
            {
                label: 'Absent',
                data: absentData,
                backgroundColor: '#e74a3b', // Red
                borderColor: '#e74a3b',
                borderWidth: 1
            },
            {
                label: 'On Leave',
                data: leaveData,
                backgroundColor: '#f6c23e', // Yellow
                borderColor: '#f6c23e',
                borderWidth: 1
            }
        ];
        window.attendanceChart.update();
    }

    function updateLeaveChart(leaveRequests) {
        const leaveTypes = ['Sick Leave', 'Vacation', 'Personal', 'Maternity/Paternity', 'Bereavement'];
        const typeCounts = leaveTypes.map(type =>
            leaveRequests.filter(req => req.leaveType === type).length
        );

        const backgroundColors = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'];

        window.leaveChart.data.labels = leaveTypes;
        window.leaveChart.data.datasets = [{
            data: typeCounts,
            backgroundColor: backgroundColors,
            borderWidth: 1
        }];
        window.leaveChart.update();
    }

// This function is used in report generation but also updates charts
    function generateAttendanceReport(employees, attendanceRecords, startDate, endDate) {
        // Filter records for the date range
        const filteredRecords = attendanceRecords.filter(rec => {
            return rec.date >= startDate && rec.date <= endDate;
        });

        // Group by employee
        const employeeAttendance = {};
        employees.forEach(emp => {
            employeeAttendance[emp.id] = {
                name: emp.name,
                department: emp.department,
                present: 0,
                absent: 0,
                records: []
            };
        });

        filteredRecords.forEach(rec => {
            if (employeeAttendance[rec.employeeId]) {
                if (rec.status === 'Present') {
                    employeeAttendance[rec.employeeId].present++;
                } else {
                    employeeAttendance[rec.employeeId].absent++;
                }
                employeeAttendance[rec.employeeId].records.push(rec);
            }
        });

        // Prepare data for chart
        const labels = [];
        const presentData = [];
        const absentData = [];

        // Get all dates in range
        const dateArray = getDatesInRange(startDate, endDate);

        dateArray.forEach(date => {
            const dateStr = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            labels.push(dateStr);

            const dayRecords = filteredRecords.filter(rec => rec.date === date);
            presentData.push(dayRecords.filter(rec => rec.status === 'Present').length);
            absentData.push(dayRecords.filter(rec => rec.status === 'Absent').length);
        });

        // Update chart
        window.reportChart.data.labels = labels;
        window.reportChart.data.datasets = [
            {
                label: 'Present',
                data: presentData,
                backgroundColor: '#1cc88a',
                borderColor: '#1cc88a',
                borderWidth: 1
            },
            {
                label: 'Absent',
                data: absentData,
                backgroundColor: '#e74a3b',
                borderColor: '#e74a3b',
                borderWidth: 1
            }
        ];
        window.reportChart.update();

        // Update table
        const tableHead = document.querySelector('#report-data-table thead');
        const tableBody = document.querySelector('#report-data-table tbody');

        tableHead.innerHTML = `
        <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Present Days</th>
            <th>Absent Days</th>
            <th>Attendance %</th>
        </tr>
    `;

        tableBody.innerHTML = '';

        Object.keys(employeeAttendance).forEach(empId => {
            const emp = employeeAttendance[empId];
            const totalDays = emp.present + emp.absent;
            const attendancePercent = totalDays > 0 ? Math.round((emp.present / totalDays) * 100) : 0;

            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${empId}</td>
            <td>${emp.name}</td>
            <td>${emp.department}</td>
            <td>${emp.present}</td>
            <td>${emp.absent}</td>
            <td>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${attendancePercent}%;" 
                        aria-valuenow="${attendancePercent}" aria-valuemin="0" aria-valuemax="100">
                        ${attendancePercent}%
                    </div>
                </div>
            </td>
        `;
            tableBody.appendChild(row);
        });
    }

// This function is used in report generation but also updates charts
    function generateLeaveReport(employees, leaveRequests, startDate, endDate) {
        // Filter requests for the date range (based on start date of leave)
        const filteredRequests = leaveRequests.filter(req => {
            return req.startDate >= startDate && req.startDate <= endDate;
        });

        // Group by employee
        const employeeLeaves = {};
        employees.forEach(emp => {
            employeeLeaves[emp.id] = {
                name: emp.name,
                department: emp.department,
                totalDays: 0,
                requests: []
            };
        });

        filteredRequests.forEach(req => {
            if (employeeLeaves[req.employeeId]) {
                employeeLeaves[req.employeeId].totalDays += req.days;
                employeeLeaves[req.employeeId].requests.push(req);
            }
        });

        // Prepare data for chart (leave type distribution)
        const leaveTypes = ['Sick Leave', 'Vacation', 'Personal', 'Maternity/Paternity', 'Bereavement'];
        const typeCounts = leaveTypes.map(type =>
            filteredRequests.filter(req => req.leaveType === type).length
        );

        const backgroundColors = [
            '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'
        ];

        // Update chart
        window.reportChart.data.labels = leaveTypes;
        window.reportChart.data.datasets = [{
            data: typeCounts,
            backgroundColor: backgroundColors,
            borderWidth: 1
        }];
        window.reportChart.type = 'pie';
        window.reportChart.update();

        // Update table
        const tableHead = document.querySelector('#report-data-table thead');
        const tableBody = document.querySelector('#report-data-table tbody');

        tableHead.innerHTML = `
        <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Total Leave Days</th>
            <th>Requests</th>
            <th>Status</th>
        </tr>
    `;

        tableBody.innerHTML = '';

        Object.keys(employeeLeaves).forEach(empId => {
            const emp = employeeLeaves[empId];

            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${empId}</td>
            <td>${emp.name}</td>
            <td>${emp.department}</td>
            <td>${emp.totalDays}</td>
            <td>${emp.requests.length}</td>
            <td>
                ${emp.requests.some(req => req.status === 'Pending') ?
                '<span class="status-badge status-pending">Pending</span>' :
                '<span class="status-badge status-approved">All Processed</span>'}
            </td>
        `;
            tableBody.appendChild(row);
        });
    }

// This function is used in report generation but also updates charts
    function generateEmployeeReport(employees) {
        const departmentStats = {};
        employees.forEach(emp => {
            if (!departmentStats[emp.department]) {
                departmentStats[emp.department] = {
                    total: 0,
                    active: 0,
                    onLeave: 0,
                    inactive: 0
                };
            }

            departmentStats[emp.department].total++;
            if (emp.status === 'Active') departmentStats[emp.department].active++;
            if (emp.status === 'On Leave') departmentStats[emp.department].onLeave++;
            if (emp.status === 'Inactive') departmentStats[emp.department].inactive++;
        });

        // Prepare data for chart
        const labels = Object.keys(departmentStats);
        const activeData = [];
        const onLeaveData = [];
        const inactiveData = [];

        labels.forEach(dept => {
            activeData.push(departmentStats[dept].active);
            onLeaveData.push(departmentStats[dept].onLeave);
            inactiveData.push(departmentStats[dept].inactive);
        });

        // Update chart
        window.reportChart.data.labels = labels;
        window.reportChart.data.datasets = [
            {
                label: 'Active',
                data: activeData,
                backgroundColor: '#1cc88a',
                borderColor: '#1cc88a',
                borderWidth: 1
            },
            {
                label: 'On Leave',
                data: onLeaveData,
                backgroundColor: '#f6c23e',
                borderColor: '#f6c23e',
                borderWidth: 1
            },
            {
                label: 'Inactive',
                data: inactiveData,
                backgroundColor: '#e74a3b',
                borderColor: '#e74a3b',
                borderWidth: 1
            }
        ];
        window.reportChart.type = 'bar';
        window.reportChart.update();

        // Update table
        const tableHead = document.querySelector('#report-data-table thead');
        const tableBody = document.querySelector('#report-data-table tbody');

        tableHead.innerHTML = `
        <tr>
            <th>Department</th>
            <th>Total Employees</th>
            <th>Active</th>
            <th>On Leave</th>
            <th>Inactive</th>
            <th>Active %</th>
        </tr>
    `;

        tableBody.innerHTML = '';

        labels.forEach(dept => {
            const stats = departmentStats[dept];
            const activePercent = Math.round((stats.active / stats.total) * 100);

            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${dept}</td>
            <td>${stats.total}</td>
            <td>${stats.active}</td>
            <td>${stats.onLeave}</td>
            <td>${stats.inactive}</td>
            <td>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${activePercent}%;" 
                        aria-valuenow="${activePercent}" aria-valuemin="0" aria-valuemax="100">
                        ${activePercent}%
                    </div>
                </div>
            </td>
        `;
            tableBody.appendChild(row);
        });
    }
    initCharts();
    updateCharts();
})