import { Iurl, UrlDB, validateUrl } from "../models/UrlShorten";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import randomstring from "randomstring";

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
      error: `You have already shortened this URL.`,
    });

  const shortenId = randomstring.generate({
    length: 6,
    charset: "alphabetic",
  });

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
      expair,
      token,
    });

    await data.save();
  }
  res.status(201).send({ shortenUrl: `${process.env.API_URL}${shortenId}` });
});

router.get("/", async (req, res) => {
  const urls = await UrlDB.find();
  res.status(200).send(urls);
});

router.get("/:shortenId", async (req: Request, res: Response) => {
  const shortenId = req.params.shortenId;
  const urlData = await UrlDB.findOne({ shortenId });
  if (!urlData) {
    return res.status(404).send({ error: "URL not found" });
  }
  if (!urlData.expair) {
    return res.send(urlData.originalUrl);
  }

  try {
    //@ts-ignore
    const decoded = jwt.verify(urlData.token, process.env.JWT_TOKEN);
    if (decoded.shortenId && decoded.shortenId !== urlData.shortenId) {
      return res.status(401).send({ error: "Invalid shorten id" });
    }
  } catch (error) {
    return res.status(401).send({ error: "The url is invalid." });
  }

  if (urlData.expair === "0") {
    return res.status(401).send({ error: "The url is not valid." });
  }
  return res.send(urlData.originalUrl);
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const expairTime = req.body.expair;
    await UrlDB.findByIdAndUpdate(
      id,
      {
        expair: expairTime,
      },
      { new: true }
    );
    if (!id) return res.status(400).send({ error: "URL not found" });
    res.send({ expairTime });
  } catch (error) {}
});

router.delete("/:id", async (req, res) => {
  const url = await UrlDB.findByIdAndDelete(req.params.id);
  if (!url)
    return res.status(400).send({ error: "The chosen url is not found!" });

  res.send("Removed Successfuly.");
});

const ExpairToken = (payload: Iurl, expair: string) => {
  const expairNumber = parseInt(expair);
  return jwt.sign(payload, `${process.env.JWT_TOKEN}`, {
    expiresIn: expairNumber,
  });
};

export default router;
