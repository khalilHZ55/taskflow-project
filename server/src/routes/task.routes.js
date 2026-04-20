const express = require("express");
const taskController = require("../controllers/task.controller");

const router = express.Router();

router.get("/",     taskController.getAll);
router.post("/",    taskController.create);
router.patch("/:id", taskController.patch);
router.delete("/:id", taskController.remove);

module.exports = router;