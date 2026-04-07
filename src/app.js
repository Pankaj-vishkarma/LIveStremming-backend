

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Security packages
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const morgan = require("morgan");


const routes = require("./routes/index");
const { errorMiddleware } = require("./middleware/error.middleware");

const path = require("path");

const app = express();


// ==========================
// SECURITY MIDDLEWARES
// ==========================

// Secure HTTP headers
app.use(helmet());

app.use(morgan("dev"));

// Prevent HTTP param pollution
app.use(hpp());

// Rate limiting (API protection)
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: {
            success: false,
            message: "Too many requests, please try again later",
        },
    })
);


// ==========================
// CORS CONFIG
// ==========================

app.use(
    cors({
        origin: [process.env.FRONTEND_URL],
        credentials: true,
    })
);


// ==========================
// BODY PARSER
// ==========================

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


// ==========================
// COOKIE PARSER
// ==========================

app.use(cookieParser());


// ==========================
// HEALTH CHECK
// ==========================

app.get("/", (req, res) => {
    res.send("API is running...");
});


// ==========================
// ROUTES
// ==========================

app.use("/api/v1", routes);


// ==========================
// 404 HANDLER
// ==========================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});


// ==========================
// GLOBAL ERROR HANDLER
// ==========================

app.use(errorMiddleware);


module.exports = app;