const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const session = require('express-session')
const helpers = require('./_helpers')
if (process.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const app = express()
const port = process.env.PORT

/* socket test */
const http = require('http');
const server = http.createServer(app);


//bodyparse set
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


app.use(session({ secret: 'numberFive', saveUninitialized: true, resave: false }))
const passport = require('./config/passport')
app.use(passport.initialize())
app.use(passport.session())

app.use(cors())
server.listen(port, () => console.log(`Example app listening on port ${port}!`))

module.exports = app

require('./routes/index')(app)
/* socket test */
const io = require('socket.io')(server)

io.on('connection', (socket) => {
  console.log(`User is online: ${socket.id}`)
  socket.emit('message', `Your socket id is  ${socket.id}`)
  socket.on('m')
  socket.on('disconnect', () => {
    console.log(`User is offline: ${socket.id}`)
  })
})