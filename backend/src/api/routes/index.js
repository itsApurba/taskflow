const express = require('express')
const userRoutes = require('./user.router')
const taskRoutes = require('./task.router')
const sprintRoutes = require('./sprint.router')


const router = express.Router()

router.get('/', (req, res) => {
    res.send('Hello World!')
})

router.use('/users', userRoutes)
router.use('/tasks', taskRoutes)
router.use('/sprint', sprintRoutes)

module.exports = router