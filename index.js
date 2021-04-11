require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const AWS = require("aws-sdk");
const { nanoid } = require("nanoid");
const fileUpload = require("express-fileupload");
const { fromBuffer } = require("pdf2pic");

const Photo = require("./models/photo");

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
});

app.use(fileUpload());
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const photos = await Photo.find();
    res.status(200).json({ success: true, photos });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post("/photo", async (req, res) => {
  try {
    const { photo } = req.files;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Body: photo.data,
      Key: `photos/${nanoid()}.jpg`,
      ACL: "public-read",
      ContentType: "image/jpeg",
    };

    await s3.upload(params).promise();
    await new Photo({ name: params.Key }).save();

    res.status(200).json({ success: true, key: params.Key });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post("/pdf2img", async (req, res) => {
  try {
    const { pdf } = req.files;

    const baseOptions = {
      width: 2550,
      height: 3300,
      density: 330,
      savePath: "./images",
    };

    const convert = fromBuffer(pdf.data, baseOptions);
    await convert();

    res.sendFile(__dirname + "/images/untitled.1.png");
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.listen(process.env.PORT || 8080, () => console.log("Started!"));
