const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../modules/admin/admin.model");

const MONGO_URI = "mongodb+srv://Pankaj_12345:Pankaj-123@cluster-0.wdpmvxf.mongodb.net/VoxyLive";

const createAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("DB connected");

        const email = "admin@gmail.com";
        const password = "Admin@123"; // change later

        // check if already exists
        const existing = await Admin.findOne({ email });

        if (existing) {
            console.log("Admin already exists");
            process.exit();
        }

        await Admin.create({
            email,
            password,
            role: "admin",
        });

        console.log("Admin created successfully");
        process.exit();

    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();