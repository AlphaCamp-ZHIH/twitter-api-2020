const sockets = []
const userSockets = {}
const socketController = require('../controllers/socket/socketController')
const socketio = require('socket.io')
const db = require('../../models')
const Message = db.Message
const User = db.User


module.exports = (server) => {
  const io = socketio(server)
  io.on('connection', (socket) => {
    /* connect */
    console.log(`User is online: ${socket.id}`)
    socket.emit('message', `Your socket id is  ${socket.id}`)
    socket.on('sendMessage', (data) => console.log(data))
    /* disconnect */
    socket.on('disconnect', () => {
      console.log(`User is offline: ${socket.id}`)
    })

    /* join public room */
    socket.on('join-public-room', async ({ userId }) => {
      const user = await User.findByPk(userId)
      io.emit('new-join', {
        name: user.name
      })
    })

    /* get public history */
    socket.on('get-public-history', async (offset, limit, cb) => {
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
    socket.on('post-public-msg', async ({ msg, userId }) => {
      const message = await Message.create({
        RoomId: 1,
        UserId: userId,
        content: msg
      })
      const user = await User.findByPk(userId)
      socket.broadcast.emit('get-public-msg', {
        msg: message.content,
        createdAt: message.createdAt,
        avatar: user.avatar
      })
    })

  })
}