require('dotenv').config();
const mongoose = require("mongoose");
const Employee = require("./models/Employee");
const Attendance = require("./models/Attendance");
const Leave = require("./models/Leave");

// Connect to MongoDB using env variable
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/employees", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB connected");
}).catch(err => {
    console.error("MongoDB connection error:", err);
});

// Sample data
const employees = [
    {
        // no _id - let MongoDB create ObjectId
        name: "Alice Johnson",
        email: "alice@example.com",
        department: "HR",
        position: "Manager",
        status: "Active"
    },
    {
        name: "Bob Smith",
        email: "bob@example.com",
        department: "IT",
        position: "Developer",
        status: "On Leave"
    }
];

async function seedDB() {
    try {
        await Employee.deleteMany({});
        await Attendance.deleteMany({});
        await Leave.deleteMany({});

        // Insert employees first
        const insertedEmployees = await Employee.insertMany(employees);

        // Use insertedEmployees' IDs for attendance and leave
        const attendance = [
            {
                employeeId: insertedEmployees[0]._id,
                date: new Date("2025-05-20"),
                checkIn: "09:00",
                checkOut: "17:00",
                status: "Present"
            },
            {
                employeeId: insertedEmployees[1]._id,
                date: new Date("2025-05-20"),
                checkIn: null,
                checkOut: null,
                status: "Leave"
            }
        ];

        const leaves = [
            {
                employeeId: insertedEmployees[0]._id,
                leaveType: "Sick Leave",
                startDate: new Date("2025-05-25"),
                endDate: new Date("2025-05-28"),
                reason: "Flu and rest",
                status: "Approved"
            },
            {
                employeeId: insertedEmployees[1]._id,
                leaveType: "Vacation",
                startDate: new Date("2025-06-01"),
                endDate: new Date("2025-06-03"),
                reason: "Family trip",
                status: "Pending"
            }
        ];

        await Attendance.insertMany(attendance);
        await Leave.insertMany(leaves);

        console.log("✅ Database seeded successfully!");
    } catch (err) {
        console.error("❌ Seeding error:", err);
    } finally {
        await mongoose.disconnect();
    }
}
seedDB();
