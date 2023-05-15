const router = require('express').Router();

const controller = require('../controllers/home.controller');

router.route('/').get(controller.getRoot);
router.route('/newCode').post(controller.newCode);
router.route('/:shortId').get(controller.showCode);
router.route('/:shortId/stats').get(controller.statsCode);

module.exports = router;