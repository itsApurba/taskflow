const express = require('express')
const { getTasks, createTask, getTask, getTaskByUser, updateTask, updateTaskStatus, assignTask, deleteTask } = require('../controllers/task.controller')

const router = express.Router()


router.get('/', getTasks)
router.get('/:id', getTask)
router.get('/user/:id', getTaskByUser)

router.post('/', createTask)
router.post('/assignee/:id/:taskId', assignTask)
router.post('/:id/status', updateTaskStatus)

router.put('/:id', updateTask)

router.delete('/:id', deleteTask)


module.exports = router