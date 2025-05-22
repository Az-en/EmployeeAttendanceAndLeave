const mongoose = require('mongoose');
const { Schema } = mongoose;

// Employee Schema
const employeeSchema = new Schema({
    _id: Number,  // optional, can let MongoDB auto-generate if you want
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    position: { type: String, required: true },
    status: { type: String, enum: ['Active', 'On Leave', 'Inactive'], default: 'Active' },
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;