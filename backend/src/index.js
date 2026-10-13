const {port, env} = require('./config/vars');
const app = require('./config/express')
const mongoose = require('./config/mongoose')


mongoose.connect()

app.listen(port, (err) => {
    if (err) {
        console.error(`Failed to start server on port ${port}: ${err.message}`)
        process.exit(1)
    }
    console.log(`App listening on port ${port} (${env})`)
})

module.exports = app