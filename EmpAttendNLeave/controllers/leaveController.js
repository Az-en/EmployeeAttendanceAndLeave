const Leave = require('../models/leave');

exports.createLeave = async (req, res) => {
    try {
        const leave = new Leave(req.body);
        await leave.save();
        res.status(201).json(leave);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find();
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLeaveById = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ error: 'Leave not found' });
        res.json(leave);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateLeave = async (req, res) => {
    try {
        const leave = await Leave.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!leave) return res.status(404).json({ error: 'Leave not found' });
        res.json(leave);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteLeave = async (req, res) => {
    try {
        const leave = await Leave.findByIdAndDelete(req.params.id);
        if (!leave) return res.status(404).json({ error: 'Leave not found' });
        res.json({ message: 'Leave deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
