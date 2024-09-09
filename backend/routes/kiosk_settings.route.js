const router = require("express").Router();
const { where, Op } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const { Kiosk_Img } = require("../db/models/associations");

router.route("/save_kiosk_image").post(async (req, res) => {
  try {
    const { images } = req.body;

    const imageEntries = images.map((image) => ({
      kiosk_img: image,
      img_screen_loc: "kiosk-main",
    }));

    await Kiosk_Img.bulkCreate(imageEntries);

    res.status(200).send({ message: "Success" });
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/fetchKioskImgs").get(async (req, res) => {
  try {
    const data = await Kiosk_Img.findAll({
      where: {
        img_screen_loc: "kiosk-main",
      },
    });

    if (data) {
      res.send(data);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

module.exports = router;
