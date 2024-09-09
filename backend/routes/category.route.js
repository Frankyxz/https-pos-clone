const router = require('express').Router()
const {where, Op} = require('sequelize')
const sequelize = require('../db/config/sequelize.config');
const {Product, Category, Category_Product, Activity_Log} = require('../db/models/associations');


// Fetch Category
router.route('/getCategory').get(async (req, res) => 
  {
    try {
        const data = await Category.findAll();

        if (data) {
        return res.json(data);
        } else {
        res.status(400);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json("Error");
    }
});

//Create Category
router.route('/create').post(async (req, res) => {

    try {
      const {name, categoryImages, userId} = req.body

      const existingCategory = await Category.findOne({
          where: {
            name: name
          },
      });
  
      if (existingCategory) {
       return res.status(201).send('Exist');
      } else {

        const newData = await Category.create({
          name: name,
          category_image: categoryImages
      });
        
        await Activity_Log.create({
          masterlist_id: userId,
          action_taken: `Category: Create a new category named ${name}`
        })
        res.status(200).json(newData);
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('An error occurred');
    }
});

//Update Category
router.route('/updateCategory/:param_id').put(async (req, res) => {
    try {
      const categoryId = req.params.param_id;
      const { name, category_image, userId } = req.body;
      
      const existingData = await Category.findOne({
        where: {
            name: name,
            category_id: { [Op.ne]: categoryId },
        },
      });
  
      if (existingData) {
        res.status(202).send('Exist');
      } else {
        const existingCategory = await Category.findOne({
          where: {
            category_id: categoryId
          }
        });

        const affectedRows = await Category.update({
            name: name,
            category_image: category_image
          },
          {
            where: { category_id: categoryId },
          }
        );

      let actionMessage = 'Category: Update ';

      if (existingCategory.name !== name && existingCategory.category_image !== category_image) {
        actionMessage += `category name from ${existingCategory.name} to ${name} and updated category image`;
      } else if (existingCategory.name !== name) {
        actionMessage += `category name from ${existingCategory.name} to ${name}`;
      } else if (existingCategory.category_image !== category_image) {
        actionMessage += `category image update`;
      } else {
        actionMessage += `with no changes`;
      }

      await Activity_Log.create({
        masterlist_id: userId,
        action_taken: actionMessage
      });
        res.status(200).json({ message: "Data updated successfully", affectedRows });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('An error occurred');
    }
  });

  router.route('/delete/:categId').delete(async (req, res) => {
    try {
      const id = req.params.categId;
      const userId = req.query.userId;

      const findProduct = await Category_Product.findAll({
        where: {
            category_id: id,
        },
      })

      if (findProduct && findProduct.length > 0) {
        res.status(202).json({ success: true });
      } else {
        const category = await Category.findOne({
          where: { category_id: id },
        });
         const deletionResult = await Category.destroy({
              where : {
                category_id: id
              },
          });

          if(deletionResult){
            await Activity_Log.create({
              masterlist_id: userId,
              action_taken: `Category: Deleted named ${category.name}`
            });

            res.json({success : true})
          } else {
            res.status(203).json({success : false})
          }
      }
    } catch (error) {
      console.error(error);
    }
  });  


  //fetch category in inventory dropdown
  router.route('/inventoryCategoryDropdown').get(async (req, res) => {
    try {
        const data = await Category.findAll();

        if (data) {
        return res.json(data);
        } else {
        res.status(400);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json("Error");
    }
});

module.exports = router;