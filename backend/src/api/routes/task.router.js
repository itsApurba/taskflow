const express = require('express')
const { getTasks, createTask, getTask, getTaskByUser, updateTask, updateTaskStatus, assignTask, deleteTask, updateTaskType } = require('../controllers/task.controller')

const router = express.Router()


router.get('/', getTasks)
router.get('/:id', getTask)
router.get('/user/:id', getTaskByUser)

router.post('/', createTask)
router.post('/assignee/:id/:taskId', assignTask)
router.post("/status/:id", updateTaskStatus);
router.post("/type/:id", updateTaskType);

router.patch('/:id', updateTask)

router.delete('/:id', deleteTask)


module.exports = router