const express = require('express')
const { addTasksToSprint, createSprint, deleteSprint, deleteTaskFromSprint, getAllSprints, updateSprint } = require('../controllers/sprint.controllers')

const router = express.Router()


router.get('/', getAllSprints)


router.post('/', createSprint)
router.post('/:id/sprint', addTasksToSprint)

router.delete('/:id', deleteSprint)
router.delete('/:id/sprint', deleteTaskFromSprint)

router.patch('/:id', updateSprint)


module.exports = router