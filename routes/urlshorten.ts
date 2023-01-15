import { Iurl, UrlDB, validateUrl } from "../models/UrlShorten";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import moment from "moment-timezone";

const time = moment().tz("Europe/Stockholm").format("hh:mm").toLocaleString();
const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const { originalUrl, expair } = req.body;
  const { error } = validateUrl(req.body);
  if (error) return res.status(400).send({ error: error.message });

  if (originalUrl.length > 1000) {
    return res.status(400).send({ error: "Invalid URL" });
  }

  const ExsitingUrl = await UrlDB.findOne({ originalUrl: originalUrl });
  if (ExsitingUrl)
    return res.status(400).send({
      error:
        "There is already same url in Database try again with different url",
    });

  const salt = await bcrypt.genSalt(10);
  const shortenId = await bcrypt
    .hash(originalUrl, salt)
    .then((hash: string) => hash.substring(0, 8));

  if (!expair) {
    const data = new UrlDB({
      shortenId,
      originalUrl,
    });

    await data.save();
  }
  if (expair) {
    const token = ExpairToken({ shortenId, originalUrl }, expair);
    const data = new UrlDB({
      shortenId,
      originalUrl,
      token,
    });

    await data.save();
  }
  res.status(201).send({ shortenUrl: `http://127.0.0.1:5173/${shortenId}` });
});

router.get("/", async (req, res) => {
  const urls = await UrlDB.find();
  res.status(200).send(urls);
});

router.get("/:shortenId", async (req: Request, res: Response) => {
  const shortenId = req.params.shortenId;

  const urlData = await UrlDB.findOne({ shortenId });
  if (urlData) {
    console.log(moment(urlData.createdAt).format("mm:ss").toLocaleString());
    const hours = new Date().getHours();
    const minutes = new Date().getMinutes();
    const secounds = new Date().getSeconds();
    console.log(hours, minutes, secounds.toLocaleString());
  }
  if (!urlData) {
    return res.status(404).send({ error: "URL not found" });
  }
  if (urlData.createdAt && urlData.createdAt < new Date().toLocaleString()) {
    return res.status(410).send({ error: "URL has expired" });
  }
  // try {
  //   //@ts-ignore
  //   const decoded = jwt.verify(urlData.token, "jsonwebtoken");
  //   if (decoded.shortenId && decoded.shortenId !== urlData.shortenId) {
  //     return res.status(401).send({ error: "Invalid shorten id" });
  //   }
  // } catch (error) {
  //   return res.status(401).send({ error: "The url is not valid." });
  // }
  return res.send(urlData.originalUrl);
});

router.delete("/:id", async (req, res) => {
  const url = await UrlDB.findByIdAndDelete(req.params.id);
  if (!url)
    return res.status(400).send({ error: "The chosen url is not found!" });

  res.send("Removed Successfuly.");
});

const ExpairToken = (payload: Iurl, time: number) => {
  return jwt.sign(payload, "jsonwebtoken", {
    expiresIn: time,
  });
};

export default router;
