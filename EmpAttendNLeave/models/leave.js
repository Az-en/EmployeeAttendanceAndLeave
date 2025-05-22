// Leave Schema
const mongoose = require('mongoose');
const { Schema } = mongoose;

const leaveSchema = new Schema({
    _id: Number,
    employeeId: { type: Number, ref: 'Employee', required: true },
    leaveType: { type: String, enum: ['Sick Leave', 'Vacation', 'Casual Leave', 'Other'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
}, { timestamps: true });

// const Leave = mongoose.model('Leave', leaveSchema);

module.exports = mongoose.model('Leave', leaveSchema,'leave_requests');