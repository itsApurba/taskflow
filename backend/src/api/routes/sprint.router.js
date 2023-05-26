const express = require('express')
const { addTasksToSprint, createSprint, deleteSprint, deleteTaskFromSprint } = require('../controllers/sprint.controllers')

const router = express.Router()


router.get('/', (req,res)=> res.send('hi'))


router.post('/', createSprint)
router.post('/:id/sprint', addTasksToSprint)

router.delete('/:id/sprint', deleteTaskFromSprint)


module.exports = router