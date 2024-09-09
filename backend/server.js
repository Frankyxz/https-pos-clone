const express = require("express");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const app = express();

const port = 8084;
require("dotenv").config();

const options = {
  key: fs.readFileSync("./certificate/key.pem"),
  cert: fs.readFileSync("./certificate/cert.pem"),
};

app.use(
  cors({
    origin: "https://https-pos-clone.vercel.app",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "500mb" }));

app.use(
  bodyParser.urlencoded({
    limit: "500mb",
    extended: true,
    parameterLimit: 100000,
  })
);

app.use(express.json());

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://https-pos-clone.vercel.app"
  );

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

//Routes:

const masterRoute = require("./routes/masterlist.route");

const userRoute = require("./routes/userRole.route");

const student = require("./routes/student.route");

const authenticateToken = require("./middleware/token_authentication.middleware");

const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

app.use("/masterList", masterRoute);
app.use("/userRole", userRoute);

app.use("/student", student);

app.listen(port, () => {
  console.log(`listening to port ${port}`);
});

// https.createServer(options, app).listen(port, () => {
// console.log("Running")
// });

// https.createServer(options, (req, res)=> {
//   res.end("SSL Added")
// })
