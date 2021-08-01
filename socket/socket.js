const socketio = require('socket.io')
const { authenticatedSocket } = require('../middleware/auth')
const socketController = require('../controllers/socket/socketController')
module.exports = (server) => {
  const io = socketio(server, {
    cors: {
      origin: ['http://localhost:8080', 'https://ryanhsun.github.io'],
      credentials: true
    },
    allowEIO3: true
  })
  io.use(authenticatedSocket).on('connection', async (socket) => {
    /* connect */
    socketController.postSocket(socket)
    socket.on('sendMessage', (data) => console.log(data))
    /* disconnect */
    socket.on('disconnect', () => {
      socketController.deleteSocket(socket, io)
    })

    /* join public room */
    socket.on('join_public_room', async ({ userId }) => {
      socketController.joinPublicRoom(userId, socket, io)
    })
    /* leave public room */
    socket.on('leave_public_room', ({ userId }) => {
      socketController.leavePublicRoom(userId, socket, io)
    })
    /* get public history */
    socket.on('get_public_history', async ({ offset, limit }, cb) => {
      const messages = await socketController.getPublicHistory(offset, limit)
      cb(messages)
    })
    /* public message (get and send) */
    socket.on('post_public_msg', ({ content, userId }) => {
      socketController.postPublicMsg(content, userId, socket)
    })
    /* join private page */
    socket.on('join_private_page', async ({ userId }) => {
      socketController.joinPrivatePage(userId, socket)
    })
    /* leave private page */
    socket.on('leave_private_page', () => {
      socketController.leavePrivatePage(socket)
    })
    /* join private room */
    socket.on('join_private_room', async ({ User1Id, User2Id }, callback) => {
      const roomId = await socketController.joinPrivateRoom(
        User1Id,
        User2Id,
        socket
      )
      //return roomId to client
      callback({ roomId })
    })

    /* get private history */
    socket.on('get_private_history', async ({ offset, limit, RoomId }, cb) => {
      const messages = await socketController.getPrivateHistory(
        offset,
        limit,
        RoomId
      )
      cb(messages)
    })
    /* private message (get and send) */
    socket.on(
      'post_private_msg',
      async ({ SenderId, ReceiverId, RoomId, content }) => {
        socketController.postPrivateMsg(
          SenderId,
          ReceiverId,
          RoomId,
          content,
          socket
        )
      }
    )
  })
}
