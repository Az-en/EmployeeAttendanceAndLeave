const Employee = require('../models/employee');

/**
 * Employee Controller - Handles all business logic related to employee management
 */
exports.createEmployee = async (req, res) => {
    try {
        // Create new employee from request body
        const employee = new Employee(req.body);
        await employee.save();
        res.status(201).json(employee); // Return 201 Created with new employee
    } catch (err) {
        // Includes error details in response for debugging
        res.status(400).json({ error: err.message, details: err });
    }
};

exports.getEmployees = async (req, res) => {
    try {
        // Get all employees from database
        const employees = await Employee.find();
        res.json(employees); // Return array of employees
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        // Find single employee by ID
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        res.json(employee); // Return found employee
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        // Find and update employee by ID
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Return updated record and validate
        );
        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        res.json(employee); // Return updated employee
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        // Delete employee by ID
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        res.json({ message: 'Employee deleted' }); // Return success message
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};