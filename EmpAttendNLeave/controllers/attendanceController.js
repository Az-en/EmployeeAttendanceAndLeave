const Attendance = require('../models/attendance');

/**
 * Attendance Controller - Handles all business logic related to employee attendance records
 */
exports.createAttendance = async (req, res) => {
    try {
        // Create a new attendance record from request body
        const attendance = new Attendance(req.body);
        await attendance.save();
        res.status(201).json(attendance); // Return 201 Created with the new record
    } catch (err) {
        res.status(400).json({ error: err.message }); // Return 400 for bad request
    }
};

exports.getAttendance = async (req, res) => {
    try {
        // Get all attendance records from database
        const attendance = await Attendance.find();
        res.json(attendance); // Return array of attendance records
    } catch (err) {
        res.status(500).json({ error: err.message }); // Return 500 for server error
    }
};

exports.getAttendanceById = async (req, res) => {
    try {
        // Find single attendance record by ID
        const attendance = await Attendance.findById(req.params.id);
        if (!attendance) return res.status(404).json({ error: 'Attendance not found' });
        res.json(attendance); // Return found record
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateAttendance = async (req, res) => {
    try {
        // Find and update attendance record by ID
        const attendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Return updated record and run validators
        );
        if (!attendance) return res.status(404).json({ error: 'Attendance not found' });
        res.json(attendance); // Return updated record
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteAttendance = async (req, res) => {
    try {
        // Delete attendance record by ID
        const attendance = await Attendance.findByIdAndDelete(req.params.id);
        if (!attendance) return res.status(404).json({ error: 'Attendance not found' });
        res.json({ message: 'Attendance deleted' }); // Return success message
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};