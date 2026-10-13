const express = require('express')
const {
  getTasks,
  createTask,
  getTask,
  getTaskByUser,
  updateTask,
  updateTaskStatus,
  assignTask,
  deleteTask,
  updateTaskType,
  searchTasksByName,
  claimTask,
  submitTask,
  approveTask,
  rejectTask,
  getMyTasks,
  getReviewQueue,
} = require('../controllers/task.controller')
const { requireRole } = require('../middleware/auth')

const router = express.Router()

const manager = requireRole('manager')
const worker = requireRole('worker')

router.get('/', getTasks)
router.get("/search", searchTasksByName);
router.get('/mine', getMyTasks)
router.get('/review', manager, getReviewQueue)
router.get('/:id', getTask)
router.get('/user/:id', getTaskByUser)

router.post('/', manager, createTask)
router.post('/:id/claim', worker, claimTask)
router.post('/:id/submit', worker, submitTask)
router.post('/:id/approve', manager, approveTask)
router.post('/:id/reject', manager, rejectTask)
router.post('/assignee/:id/:taskId', assignTask)
router.post("/status/:id", updateTaskStatus);
router.post("/type/:id", updateTaskType);

router.patch('/:id', updateTask)

router.delete('/:id', deleteTask)


module.exports = router
