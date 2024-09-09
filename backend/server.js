const express = require("express");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const app = express();

const port = 3306;
require("dotenv").config();

const options = {
  key: fs.readFileSync("./certificate/key.pem"),
  cert: fs.readFileSync("./certificate/cert.pem"),
};

app.use(
  cors({
    origin: "https://env-2503369.user.edgecloudph.com:3000",
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
    "https://env-2503369.user.edgecloudph.com:3000"
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
const activitylog = require("./routes/activity_log.route.js");
const masterRoute = require("./routes/masterlist.route");

const userRoute = require("./routes/userRole.route");

const category = require("./routes/category.route");

const product = require("./routes/product.route");

const category_product = require("./routes/category_product.route");
const raw_material = require("./routes/raw_material.route.js");
const inventory = require("./routes/inventory.route");

const order = require("./routes/order.route");
const order_record = require("./routes/order_record.route.js");

const student = require("./routes/student.route");

const receiving_stock_inventory = require("./routes/receiving_stock_inventory.route.js");

const product_inventory = require("./routes/product_inventory.route.js");

const product_inventory_accumulate = require("./routes/product_inventory_accumulate.route.js");
const product_inventory_outbound = require("./routes/product_inventory_outbound.route.js");
const product_inventory_counting = require("./routes/stock_counting.route.js");

const student_balance = require("./routes/student_balance.route.js");
const load_transaction = require("./routes/load_transaction.route.js");

const reports = require("./routes/reports.route.js");

const cook_book = require("./routes/cook_book.route.js");
const variant = require("./routes/settings_variant.route.js");

const customize_receipt = require("./routes/customize_receipt.route.js");
const specification = require("./routes/specification.route.js");

const store_profile = require("./routes/store_profile.route.js");
const user_transaction = require("./routes/user_transaction.route.js");
const endshift = require("./routes/endshift.route.js");
const kiosk_settings = require("./routes/kiosk_settings.route.js");
const authenticateToken = require("./middleware/token_authentication.middleware");

const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

app.use("/masterList", masterRoute);
app.use("/userRole", userRoute);
app.use("/category", category);
app.use("/product", product);
app.use("/category_product", category_product);
app.use("/inventory", inventory);
app.use("/order", order);
app.use("/student", student);
app.use("/receiving_stock_inventory", receiving_stock_inventory);
app.use("/product_inventory", product_inventory);
app.use("/product_inventory_accumulate", product_inventory_accumulate);
app.use("/product_inventory_outbound", product_inventory_outbound);
app.use("/stockCounting", product_inventory_counting);
app.use("/student_balance", student_balance);
app.use("/load_transaction", load_transaction);
app.use("/reports", reports);
app.use("/rawmaterial", raw_material);
app.use("/orderRecords", order_record);
app.use("/cook_book", cook_book);
app.use("/customize_receipt", customize_receipt);
app.use("/variant", variant);
app.use("/specifications", specification);
app.use("/store_profile", store_profile);
app.use("/user_transaction", user_transaction);
app.use("/activityLog", activitylog);
app.use("/endshift", endshift);
app.use("/kiosk_settings", kiosk_settings);

app.listen(port, () => {
  console.log(`listening to port ${port}`);
});

// https.createServer(options, app).listen(port, () => {
// console.log("Running")
// });

// https.createServer(options, (req, res)=> {
//   res.end("SSL Added")
// })
