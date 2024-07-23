const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const uniqid = require("uniqid");

router.post("/upload", async (req, res) => {
  const resultCloudinary = await cloudinary.uploader.upload("./tmp/photo.jpg");

  fs.unlinkSync("./tmp/photo.jpg");

  res.json({ result: true, url: resultCloudinary.secure_url });
});
