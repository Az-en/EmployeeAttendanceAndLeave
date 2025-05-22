document.addEventListener('DOMContentLoaded',function (){
    const addEmployeeBtn = document.getElementById('add-employee-btn');
    const cancelEmployeeBtn = document.getElementById('cancel-employee-btn');
    const employeeFormContainer = document.getElementById('employee-form-container');

    // Show form when Add Employee button is clicked
    addEmployeeBtn.addEventListener('click', function() {
        employeeFormContainer.classList.remove('d-none');
    });

    // Hide form when Cancel button is clicked
    cancelEmployeeBtn.addEventListener('click', function() {
        employeeFormContainer.classList.add('d-none');
    });

    // Form submission handling would go here
    document.getElementById('employee-form').addEventListener('submit', function(e) {
        e.preventDefault();
        // Handle form submission
        employeeFormContainer.classList.add('d-none');
    });

// Placeholder functions (replace with actual logic later)
    function editEmployee(id) {
        console.log("Edit employee with ID:", id);
        // Your edit logic here (e.g., open a modal)
    }

    async function confirmDelete(type, id) {
        if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

        try {
            const response = await fetch(`/api/employees/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete employee');
            }

            showNotification('Success', `${type} deleted successfully`, 'success');
            await loadEmployees(); // Refresh the employee list
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
            showNotification('Error', error.message, 'error');
        }
    }


    function showNotification(title, message, type) {
        console.log(`[${type}] ${title}: ${message}`);
        // Replace with Toast/SweetAlert/your UI library
        alert(`${title}: ${message}`);
    }


    //========================= EMPLOYEE FUNCTIONS=======================
    let submitBtn = document.getElementById('save-employee-btn');
    submitBtn.addEventListener('click',addEmployee);

    async function loadEmployees() {
        const tableBody = document.getElementById('employees-table-body');
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Loading employees...</td></tr>';

        try {
            const response = await fetch('/api/employees');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const employees = await response.json();


            if (!employees.length) {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No employees found</td></tr>';
                return;
            }

            tableBody.innerHTML = ''; // Clear loading message

            employees.forEach(employee => {
                const row = document.createElement('tr');

                // Determine badge class based on status
                let badgeClass = 'bg-secondary';
                const status = employee.status.toLowerCase();
                if (status === 'active') badgeClass = 'bg-success';
                else if (status === 'inactive') badgeClass = 'bg-danger';
                else if (status.includes('leave')) badgeClass = 'bg-warning';

                row.innerHTML = `
                <td class="align-middle">${String(employee._id).padStart(3, '0')}</td>
                <td class="align-middle">${employee.name}</td>
                <td class="align-middle">${employee.email}</td>
                <td class="align-middle">${employee.department}</td>
                <td class="align-middle">${employee.position}</td>
                <td class="align-middle"><span class="badge ${badgeClass}">${employee.status}</span></td>
                <td class="align-middle text-end">
                    <button class="btn btn-sm btn-outline-primary me-1 edit-btn" data-id="${employee._id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${employee._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
                tableBody.appendChild(row);
            });

            // Add event listeners
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => editEmployee(btn.dataset.id));
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => confirmDelete('employee', btn.dataset.id));
            });

        } catch (err) {
            console.error('Error loading employees:', err);
            tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-danger">
                    Error loading employees. ${err.message}
                </td>
            </tr>
        `;
            showNotification('Error', `Failed to load employees: ${err.message}`, 'error');
        }
    }

    async function addEmployee() {
        // Clear previous validation errors
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

        // Get form values
        const formData = {
            _id: document.getElementById('emp-id').value.trim(),
            name: document.getElementById('emp-name').value.trim(),
            email: document.getElementById('emp-email').value.trim(),
            department: document.getElementById('emp-dept').value.trim(),
            position: document.getElementById('emp-position').value.trim(),
            status: document.getElementById('emp-status').value
        };

        // Basic validation
        let isValid = true;

        // Validate required fields
        if (!formData.name) {
            showError('emp-name', 'Full name is required');
            isValid = false;
        }

        if (!formData._id) {
            showError('emp-name', 'Full name is required');
            isValid = false;
        }

        if (!formData.email) {
            showError('emp-email', 'Email is required');
            isValid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            showError('emp-email', 'Invalid email format');
            isValid = false;
        }


        if (!formData.department) {
            showError('emp-dept', 'Department is required');
            isValid = false;
        }

        if (!formData.position) {
            showError('emp-position', 'Position is required');
            isValid = false;
        }


        if (!isValid) return;
        console.log(formData)
        try {
            // Show loading state
            const saveBtn = document.getElementById('save-employee-btn');
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';

            // Submit to API
            const response = await fetch('/api/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add employee');
            }

            const newEmployee = await response.json();

            // Show success message
            showNotification('Success', 'Employee added successfully', 'success');

            // Reset form and hide it
            document.getElementById('employee-form').reset();
            document.getElementById('employee-form-container').classList.add('d-none');

            // Refresh employee list
            await loadEmployees();

        } catch (error) {
            console.error('Error adding employee:', error);
            showNotification('Error', error.message, 'error');
        } finally {
            // Reset button state
            const saveBtn = document.getElementById('save-employee-btn');
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Employee';
        }
    }

// Helper function to show validation errors
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);

        field.classList.add('is-invalid');
        errorElement.textContent = message;
    }

// Attach to form submission
    document.getElementById('employee-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        await addEmployee();
    });
    // FUNCTION CALLS
    loadEmployees();
})