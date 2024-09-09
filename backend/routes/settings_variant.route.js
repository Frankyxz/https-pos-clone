const router = require("express").Router();
const { where, Op } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const {
  Product,
  Category,
  Category_Product,
  Specification_Main,
  Specification_Variant,
  Category_Product_Specification,
  Activity_Log,
} = require("../db/models/associations");

router.route("/createVariant").post(async (req, res) => {
  try {
    const { userId, currentSpec, selectedProducts } = req.body;

    const isExist = await Specification_Main.findOne({
      where: {
        specification_name: currentSpec.name,
        specification_type: currentSpec.type,
      },
    });

    if (isExist) {
      return res.status(201).json({ message: "Variant exist" });
    } else {
      const main_ID = await Specification_Main.create({
        specification_name: currentSpec.name,
        specification_type: currentSpec.type,
      });

      const variantPromises = currentSpec.subOptions.map((subOption) =>
        Specification_Variant.create({
          specification_main_id: main_ID.specification_main_id,
          variant_name: subOption.subName,
          variant_price: subOption.price === "" ? 0 : subOption.price,
          status: true,
        })
      );

      await Promise.all(variantPromises);

      const specCatProdPromises = selectedProducts.map((idCatProd) =>
        Category_Product_Specification.create({
          specification_main_id: main_ID.specification_main_id,
          product_id: idCatProd.prod_id,
        })
      );

      await Promise.all(specCatProdPromises);

      const act_log = await Activity_Log.create({
        masterlist_id: userId,
        action_taken: `Created new extra option for '${currentSpec.type}' named '${currentSpec.name}'`,
      });

      if (act_log) {
        return res
          .status(200)
          .json({ message: "Variant created successfully" });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Used Module:

//Settings Link Product (product-extra-options)
router.route("/fetchSpecificProdCategory_settings").get(async (req, res) => {
  try {
    const data = await Category_Product.findAll({
      include: [
        {
          model: Category,
          required: true,
        },
        {
          model: Product,
          required: true,
          where: {
            is_archived: 0,
          },
        },
      ],
      where: {
        category_id: req.query.Idcategory,
        status: "Active",
      },
    });

    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

router.route("/getSpecification").get(async (req, res) => {
  const data = await Specification_Main.findAll({
    include: [
      {
        model: Specification_Variant,
        required: true,
        where: {
          status: true,
        },
      },
      {
        model: Category_Product_Specification,
        required: false,

        include: [
          {
            model: Product,
            required: true,
          },
        ],
      },
    ],
    where: {
      specification_type: "Specification",
    },
  });

  return res.json(data);
});

router.route("/getExtraOption").get(async (req, res) => {
  const data = await Specification_Main.findAll({
    include: [
      {
        model: Specification_Variant,
        required: true,
        where: {
          status: true,
        },
      },
      {
        model: Category_Product_Specification,
        required: false,

        include: [
          {
            model: Product,
            required: true,
          },
        ],
      },
    ],
    where: {
      specification_type: "Options",
    },
  });

  return res.json(data);
});

router.route("/getExtraNeeding").get(async (req, res) => {
  const data = await Specification_Main.findAll({
    include: [
      {
        model: Specification_Variant,
        required: true,
        where: {
          status: true,
        },
      },
      {
        model: Category_Product_Specification,
        required: false,

        include: [
          {
            model: Product,
            required: true,
          },
        ],
      },
    ],
    where: {
      specification_type: "Needing",
    },
  });

  return res.json(data);
});

router.route("/updateSpecification").post(async (req, res) => {
  const { userId, updateIDSpecs, currentSpecEdit, selectedProducts } =
    req.query;

  try {
    const { name, subOptions } = currentSpecEdit;
    await Specification_Main.update(
      {
        specification_name: name,
      },
      {
        where: { specification_main_id: updateIDSpecs },
      }
    );

    const subOptionPromises = subOptions.map(async (subOption) => {
      await Specification_Variant.update(
        {
          status: false,
        },
        {
          where: {
            specification_main_id: updateIDSpecs,
            variant_name: {
              [Op.ne]: "Default_Regular",
            },
          },
        }
      );

      const isExit = await Specification_Variant.findOne({
        where: {
          specification_main_id: updateIDSpecs,
          variant_name: subOption.subName,
        },
      });

      if (isExit) {
        await Specification_Variant.update(
          {
            variant_name: subOption.subName,
            variant_price: subOption.price,
            status: true,
          },
          {
            where: {
              variant_name: subOption.subName,
              specification_main_id: updateIDSpecs,
            },
          }
        );
      } else {
        await Specification_Variant.create({
          specification_main_id: updateIDSpecs,
          variant_name: subOption.subName,
          variant_price: subOption.price,
          status: true,
        });
      }

      // console.log(subOption);
    });

    await Promise.all(subOptionPromises);

    await Category_Product_Specification.destroy({
      where: {
        specification_main_id: updateIDSpecs,
      },
    });

    if (selectedProducts && selectedProducts.length > 0) {
      const specCatProdPromises = selectedProducts.map(async (idCatProd) => {
        await Category_Product_Specification.create({
          specification_main_id: updateIDSpecs,
          product_id: idCatProd.product_id,
        });
      });

      await Promise.all(specCatProdPromises);
    }

    const act_log = await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Updated the information of extra option named '${name}'`,
    });

    if (act_log) {
      res.status(200).json({ message: "Specification updated successfully" });
    }
  } catch (error) {
    console.error("Error updating specification:", error);
    res.status(500).json({ error: "Failed to update specification" });
  }
});

module.exports = router;
