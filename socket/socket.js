const sockets = []
const userSockets = {}
const socketController = require('../controllers/socket/socketController')
const socketio = require('socket.io')
const db = require('../models')
const Message = db.Message
const User = db.User


module.exports = (server) => {
  const io = socketio(server)
  io.on('connection', (socket) => {
    /* connect */
    sockets.push(socket)
    userSockets[socket.id] = 1
    console.log(`User is online: ${socket.id}`)
    console.log('sockets', sockets)
    console.log('userSockets', userSockets)
    socket.emit('message', `Your socket id is  ${socket.id}`)
    socket.on('sendMessage', (data) => console.log(data))
    /* disconnect */
    socket.on('disconnect', () => {
      delete userSockets[socket.id]
      sockets.splice(sockets.indexOf(socket), 1)
      console.log(`User is offline: ${socket.id}`)
      console.log('sockets', sockets)
      console.log('userSockets', userSockets)
    })

    /* join public room */
    socket.on('join_public_room', async ({ userId }) => {
      const user = await User.findByPk(userId)
      io.emit('new_join', {
        name: user.name
      })
    })

    /* get public history */
    socket.on('get_public_history', async (offset, limit, cb) => {
      const message = await Message.findAll({
        offset,
        limit,
        order: [['createdAt', 'desc']],
        include: [
          {
            model: User,
            attributes: ['avatar'],
            as: 'User'
          }
        ]
      })
      cb(message)
    })

    /* public message */
    socket.on('post_public_msg', async ({ msg, userId }) => {
      const message = await Message.create({
        RoomId: 1,
        UserId: userId,
        content: msg
      })
      const user = await User.findByPk(userId)
      socket.broadcast.emit('get_public_msg', {
        msg: message.content,
        createdAt: message.createdAt,
        avatar: user.avatar
      })
    })

  })
}