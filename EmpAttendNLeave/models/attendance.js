const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceSchema = new Schema({
    _id: { type: Number, required: false },  // Using Number as ID
    employeeId: { type: Number, required: true },
    date: { type: Date, required: true },
    checkIn: { type: String, default: null },
    checkOut: { type: String, default: null },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Leave'],
        required: true
    }
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema, 'attendance'); // Third param defines collection name

module.exports = Attendance;
