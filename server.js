const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

const PORT = process.env.PORT || 3000;

const MONGO_URI =
    "mongodb://127.0.0.1:27017/employee_db";


// =====================================
// MIDDLEWARE
// =====================================

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// =====================================
// TEST ROUTE
// =====================================

app.get("/test", (req, res) => {

    res.json({
        success: true,
        message: "Server is working"
    });

});


// =====================================
// EMPLOYEE SCHEMA
// =====================================

const employeeSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    phone: {
        type: String,
        required: true
    },

    department: {
        type: String,
        required: true
    },

    position: {
        type: String,
        required: true
    },

    salary: {
        type: Number,
        required: true,
        min: 0
    },

    dateOfJoining: {
        type: Date,
        required: true
    }

}, {
    timestamps: true
});


// =====================================
// EMPLOYEE MODEL
// =====================================

const Employee =
    mongoose.model(
        "Employee",
        employeeSchema
    );


// =====================================
// ADD EMPLOYEE
// =====================================

app.post("/api/employees", async (req, res) => {

    try {

        console.log("Employee data received:");
        console.log(req.body);


        const employee =
            await Employee.create(req.body);


        console.log("Employee saved:");
        console.log(employee);


        res.status(201).json({

            success: true,

            message: "Employee added successfully",

            employee: employee

        });

    }

    catch (err) {

        console.error("Error adding employee:");
        console.error(err);


        if (err.code === 11000) {

            return res.status(400).json({

                success: false,

                error: "Employee with this email already exists"

            });

        }


        res.status(400).json({

            success: false,

            error: err.message

        });

    }

});


// =====================================
// GET ALL EMPLOYEES
// =====================================

app.get("/api/employees", async (req, res) => {

    try {

        const employees =
            await Employee
                .find()
                .sort({
                    createdAt: -1
                });


        res.json(employees);

    }

    catch (err) {

        console.error(
            "Error loading employees:",
            err
        );


        res.status(500).json({

            error: err.message

        });

    }

});


// =====================================
// DELETE EMPLOYEE
// =====================================

app.delete("/api/employees/:id", async (req, res) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {

        return res.status(400).json({

            success: false,

            error: "Invalid employee ID"

        });

    }

    try {

        const result =
            await Employee.findByIdAndDelete(
                req.params.id
            );


        if (!result) {

            return res.status(404).json({

                error: "Employee not found"

            });

        }


        res.json({

            success: true,

            message: "Employee deleted successfully"

        });

    }

    catch (err) {

        console.error(
            "Delete error:",
            err
        );


        res.status(500).json({

            error: err.message

        });

    }

});


// =====================================
// START SERVER
// =====================================

async function start() {

    try {

        await mongoose.connect(MONGO_URI);


        console.log(
            "Connected to MongoDB at",
            MONGO_URI
        );


        const server = app.listen(PORT, () => {

            console.log(
                `Server running at http://localhost:${PORT}`
            );

        });

        server.on("error", (err) => {

            if (err.code === "EADDRINUSE") {

                console.error(
                    `Port ${PORT} is already in use.`
                );

                console.error(
                    "Stop the existing process or set a different PORT."
                );

            }

            else {

                console.error(
                    "Server failed to start:",
                    err.message
                );

            }

            process.exit(1);

        });

    }

    catch (err) {

        console.error(
            "MongoDB connection failed:"
        );

        console.error(
            err.message
        );

        process.exit(1);

    }

}


start();