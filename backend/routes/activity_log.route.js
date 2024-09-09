const router = require('express').Router()
const {where, Op} = require('sequelize')
const sequelize = require('../db/config/sequelize.config');
const {MasterList, Activity_Log} = require('../db/models/associations');


router.route('/getActivityLog').get(async (req, res) => {
    try {
      const Notsuperadmin = await MasterList.findAll({
        where: {
          user_type: { [Op.ne]: 'Superadmin' },
        },
      });
  
      const userIdtype = Notsuperadmin.map((item) => item.col_id);
  
      const actlog = await Activity_Log.findAll({
        include: [{
          model: MasterList,
          required: true,
        }],
        
        attributes: [
          'masterlist_id',
          [sequelize.fn('MAX', sequelize.col('Activity_Log.createdAt')), 'maxCreatedAt'],
        ],
        where: {
          masterlist_id: userIdtype,
        },
        group: ['masterlist_id'],
        order: [['maxCreatedAt', 'DESC']],
      });
  
      res.status(200).json(actlog);
    } catch (err) {
      console.error(err);
      res.status(500).json('Error');
    }
  });

  router.route("/fetchDropdownActivityLog").get(async (req, res) => {
    try {
      const data = await Activity_Log.findAll({
        where: {
            masterlist_id: req.query.id,
        },
        order: [['createdAt', 'DESC']],
        // include: [{
        //     model: MasterList,
        //     required: true,
        // }],
      });
      return res.json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "An error occurred" });
    }
  });

  module.exports = router;