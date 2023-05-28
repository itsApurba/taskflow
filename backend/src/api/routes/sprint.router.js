const express = require('express')
const { addTasksToSprint, createSprint, deleteSprint, deleteTaskFromSprint, getAllSprints } = require('../controllers/sprint.controllers')

const router = express.Router()


router.get('/', getAllSprints)


router.post('/', createSprint)
router.post('/:id/sprint', addTasksToSprint)

router.delete('/:id/sprint', deleteTaskFromSprint)


module.exports = router