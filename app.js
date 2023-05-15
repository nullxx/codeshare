const mongoose = require("mongoose");
const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const connection = mongoose.connect(process.env.CONN_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const app = express();

app.use(express.static("public"));
app.use(express.json({ limit: "10mb" }));

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.use(
  cors({
    origin: "*",
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use("/", require("./routes/index"));

app.use((error, req, res, next) => {
  if (req.headers.back) {
    return res.send({ error: true, message: error.message || error });
  }

  return res.render("error", { error });
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
