import { Schema, Model } from "mongoose";
import mongoose from "mongoose";
import Joi from "joi";
import moment from "moment-timezone";

const time = moment().tz("Europe/Stockholm").toLocaleString();

export interface Iurl {
  originalUrl: string;
  shortenId?: string;
  expair?: string;
  token?: string;
  createdAt?: string;
}

const UrlSchema: Schema<Iurl> = new mongoose.Schema({
  originalUrl: {
    type: String,
  },
  shortenId: {
    type: String,
  },
  expair: {
    type: String,
  },
  token: {
    type: String,
  },
  createdAt: {
    type: String,
    default: time,
  },
});

export const UrlDB: Model<Iurl> = mongoose.model("Urls", UrlSchema);

export function validateUrl(url: string) {
  const Schema = Joi.object({
    originalUrl: Joi.string()
      .uri({ allowQuerySquareBrackets: true })
      .label("URL")
      .required(),
    expair: Joi.string().allow("").label("expair"),
  });
  return Schema.validate(url);
}