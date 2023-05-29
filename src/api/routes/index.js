const express = require('express')
const userRoutes = require('./user.router')
const taskRoutes = require('./task.router')
const sprintRoutes = require('./sprint.router')
const authRoutes = require('./auth.router')
const passport = require('passport')

const router = express.Router()

router.get('/', (req, res) => {
    res.send('Hello World!')
})

router.use('/users', userRoutes)
// router.use("/tasks", passport.authenticate("jwt", { session: false }), taskRoutes);
// router.use("/sprints", passport.authenticate("jwt", { session: false }), sprintRoutes);
router.use("/tasks", taskRoutes);
router.use("/sprints", sprintRoutes);
router.use('/auth', authRoutes)

module.exports = router