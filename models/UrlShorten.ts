import mongoose, { Schema, Model } from "mongoose";
import Joi from "joi";

export interface Iurl {
  originalUrl: string;
  shortenId?: string;
  expair?: string;
  token?: string;
}

const UrlSchema: Schema<Iurl> = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
    },
    shortenId: String,
    expair: String,
    token: String,
  },
  { timestamps: true }
);

export const UrlDB: Model<Iurl> = mongoose.model("Urls", UrlSchema);

export function validateUrl(url: string) {
  const Schema = Joi.object({
    originalUrl: Joi.string()
      .uri({ allowQuerySquareBrackets: true })
      .label("URL need to start with http or https")
      .required(),
    expair: Joi.string().allow("").label("expair"),
  });
  return Schema.validate(url);
}
