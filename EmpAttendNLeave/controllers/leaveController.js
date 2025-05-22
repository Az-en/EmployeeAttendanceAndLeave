const Leave = require('../models/leave');

/**
 * Leave Controller - Handles all business logic related to employee leave requests
 */
exports.createLeave = async (req, res) => {
    try {
        // Create new leave request from request body
        const leave = new Leave(req.body);
        await leave.save();
        res.status(201).json(leave); // Return 201 Created with new leave
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getLeaves = async (req, res) => {
    try {
        // Get all leave requests from database
        const leaves = await Leave.find();
        res.json(leaves); // Return array of leave requests
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLeaveById = async (req, res) => {
    try {
        // Find single leave request by ID
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ error: 'Leave not found' });
        res.json(leave); // Return found leave request
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateLeave = async (req, res) => {
    try {
        // Find and update leave request by ID
        const leave = await Leave.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Return updated record and validate
        );
        if (!leave) return res.status(404).json({ error: 'Leave not found' });
        res.json(leave); // Return updated leave request
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteLeave = async (req, res) => {
    try {
        // Delete leave request by ID
        const leave = await Leave.findByIdAndDelete(req.params.id);
        if (!leave) return res.status(404).json({ error: 'Leave not found' });
        res.json({ message: 'Leave deleted' }); // Return success message
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};