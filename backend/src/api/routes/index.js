const express = require('express')
const userRoutes = require('./user.router')
const taskRoutes = require('./task.router')
const sprintRoutes = require('./sprint.router')
const authRoutes = require('./auth.router')
const rewardRoutes = require('./reward.router')
const redemptionRoutes = require('./redemption.router')
const penaltyRoutes = require('./penalty.router')
const { authenticate } = require('../middleware/auth')
const { getMe } = require('../controllers/user.controller')
const { getMarket } = require('../controllers/task.controller')
const { getWallet } = require('../controllers/wallet.controller')
const { getLeaderboard } = require('../controllers/leaderboard.controller')

const router = express.Router()

router.get('/', (req, res) => {
    res.send('Hello World!')
})

// Public: /auth/*, and /users/managers (the user router authenticates the rest itself).
router.use('/auth', authRoutes)
router.use('/users', userRoutes)

// Everything below requires a JWT.
router.use(authenticate)
router.get('/me', getMe)
router.get('/market', getMarket)
router.get('/wallet', getWallet)
router.get('/leaderboard', getLeaderboard)
router.use('/tasks', taskRoutes)
router.use('/sprints', sprintRoutes)
router.use('/rewards', rewardRoutes)
router.use('/redemptions', redemptionRoutes)
router.use('/penalties', penaltyRoutes)

module.exports = router
