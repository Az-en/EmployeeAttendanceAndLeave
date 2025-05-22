document.addEventListener('DOMContentLoaded', function () {
    const requestLeaveBtn = document.getElementById('add-leave-btn');
    const cancelLeaveBtn = document.getElementById('cancel-leave-btn');
    const leaveFormContainer = document.getElementById('leave-form-container');
    const approveBtn = document.getElementById('approve-btn');
    const disapproveBtn = document.getElementById('disapprove-btn');
    const deleteBtn = document.getElementById('delete-btn');


    document.querySelectorAll('#approve-btn').forEach(btn => {
        console.log(btn.innerText);
        btn.addEventListener('click', () => approveLeaveRequest(btn.dataset.id));
    });

    document.querySelectorAll('#disapprove-btn').forEach(btn => {
        console.log(btn.innerText);
        btn.addEventListener('click', () => disapproveLeaveRequest(btn.dataset.id));
    });

    document.querySelectorAll('#delete-btn').forEach(btn => {
        console.log(btn.innerText);
        btn.addEventListener('click', () => deleteLeaveRequest(btn.dataset.id));
    });

    // Show form
    requestLeaveBtn.addEventListener('click', function () {
        leaveFormContainer.classList.remove('d-none');
    });

    // Hide form
    cancelLeaveBtn.addEventListener('click', function () {
        leaveFormContainer.classList.add('d-none');
    });

    // Submit Leave Form
    document.getElementById('submit-leave-btn').addEventListener('click', async function (e) {
        e.preventDefault();
        await submitLeaveRequest();
    });


    // approve a leave request
    async function approveLeaveRequest(id) {
        try {
            const response = await fetch(`/api/leaves/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'Approved' })
            });

            if (!response.ok) throw new Error('Failed to approve leave');

            showNotification('Success', 'Leave approved successfully', 'success');
            await loadLeaves(); // Refresh the table
        } catch (error) {
            console.error('Error approving leave:', error);
            showNotification('Error', error.message, 'error');
        }
    }


    //disapprove a leave request
    async function disapproveLeaveRequest(id) {
        try {
            const response = await fetch(`/api/leaves/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'Rejected' })
            });

            if (!response.ok) throw new Error('Failed to reject leave');

            showNotification('Success', 'Leave rejected', 'success');
            await loadLeaves();
        } catch (error) {
            console.error('Error rejecting leave:', error);
            showNotification('Error', error.message, 'error');
        }
    }



    // delete request
    async function deleteLeaveRequest(id) {
        if (!confirm('Are you sure you want to delete this leave request?')) return;

        try {
            const response = await fetch(`/api/leaves/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete leave');

            showNotification('Success', 'Leave request deleted', 'success');
            await loadLeaves();
        } catch (error) {
            console.error('Error deleting leave:', error);
            showNotification('Error', error.message, 'error');
        }
    }


    async function loadLeaves() {
        const tableBody = document.getElementById('leave-table-body');
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Loading leave requests...</td></tr>';

        try {
            const response = await fetch('/api/leaves');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const leaves = await response.json();

            if (!leaves.length) {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No leave requests found</td></tr>';
                return;
            }

            tableBody.innerHTML = '';

            leaves.forEach((leave, index) => {
                const row = document.createElement('tr');

                const startDate = new Date(leave.startDate).toLocaleDateString();
                const endDate = new Date(leave.endDate).toLocaleDateString();
                let badgeClass = 'bg-secondary';
                const status = leave.status.toLowerCase();
                if (status === 'approved') badgeClass = 'bg-success';
                else if (status === 'pending') badgeClass = 'bg-warning';
                else if (status === 'rejected') badgeClass = 'bg-danger';

                row.innerHTML = `
                    <td>${leave._id }</td>
                    <td>${leave.employeeName || leave.employeeId}</td>
                    <td>${leave.leaveType}</td>
                    <td>${startDate} to ${endDate}</td>
                    <td>${leave.reason}</td>
                    <td><span class="badge ${badgeClass}">${leave.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-success approve-btn" data-id="${leave._id}">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning disapprove-btn" data-id="${leave._id}">
                            <i class="fas fa-times"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${leave._id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;

                tableBody.appendChild(row);
            });

            // Set up event listeners for the dynamically created buttons
            document.querySelectorAll('.approve-btn').forEach(btn => {
                btn.addEventListener('click', () => approveLeaveRequest(btn.dataset.id));
            });

            document.querySelectorAll('.disapprove-btn').forEach(btn => {
                btn.addEventListener('click', () => disapproveLeaveRequest(btn.dataset.id));
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteLeaveRequest(btn.dataset.id));
            });
        } catch (err) {
            console.error('Error loading leaves:', err);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4 text-danger">
                        Error loading leaves. ${err.message}
                    </td>
                </tr>
            `;
            showNotification('Error', `Failed to load leaves: ${err.message}`, 'error');
        }
    }

    async function submitLeaveRequest() {
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        const addBtn = document.getElementById('add-attendance-btn');
        const formContainer = document.getElementById('leave-form-container');
        const form = document.getElementById('leave-form');
        const cancelBtn = document.getElementById('cancel-leave-btn');



        // Hide form on cancel
        cancelBtn.addEventListener('click', () => {
            form.reset();
            formContainer.classList.add('d-none');
        });
        const rawDateStart = document.getElementById('leave-start').value();
        const rawDateEnd = document.getElementById('leave-end').value();
        const formData = {
            _id: document.getElementById('leave-id').value.trim(),
            employeeId: document.getElementById('leave-employee').value,
            leaveType: document.getElementById('leave-type').value,
            startDate: rawDateStart,
            endDate: rawDateEnd,
            reason: document.getElementById('leave-reason').value.trim(),
        };
        console.log(formData);
        let isValid = true;

        if (!formData.employeeId) {
            showError('leave-employee', 'Employee is required');
            isValid = false;
        }

        if (!formData.leaveType) {
            showError('leave-type', 'Leave type is required');
            isValid = false;
        }

        if (!formData.startDate) {
            showError('leave-start', 'Start date is required');
            isValid = false;
        }

        if (!formData.endDate) {
            showError('leave-end', 'End date is required');
            isValid = false;
        }

        if (!formData.reason) {
            showError('leave-reason', 'Reason is required');
            isValid = false;
        }

        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            showError('leave-end', 'End date cannot be before start date');
            isValid = false;
        }

        if (!isValid) return;

        try {
            const submitBtn = document.getElementById('submit-leave-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Submitting...';

            const response = await fetch('/api/leaves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Failed to submit leave request');
            }

            showNotification('Success', 'Leave request submitted successfully', 'success');
            document.getElementById('leave-form').reset();
            leaveFormContainer.classList.add('d-none');
            await loadLeaves();

        } catch (err) {
            console.error('Error submitting leave:', err);
            showNotification('Error', err.message, 'error');
        } finally {
            const submitBtn = document.getElementById('submit-leave-btn');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
    }

    async function confirmDelete(type, id) {
        if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

        try {
            const response = await fetch(`/api/leaves/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete leave');
            }

            showNotification('Success', `${type} deleted successfully`, 'success');
            await loadLeaves();
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
            showNotification('Error', error.message, 'error');
        }
    }

    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);

        field.classList.add('is-invalid');
        errorElement.textContent = message;
    }

    function showNotification(title, message, type) {
        alert(`${title}: ${message}`); // Replace with toast in production
    }

    // Initial load
    loadLeaves();
});
