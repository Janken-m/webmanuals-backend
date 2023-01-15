import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import UrlShorten from "./routes/urlshorten";

const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());
app.use("/api/shorten", UrlShorten);

mongoose
  .set("strictQuery", false)
  .connect("mongodb://localhost:27017/webmanual")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Could not connect to MongoDB", err));

app.listen(port, () => console.log(`App listen on port ${port}🌏`));
