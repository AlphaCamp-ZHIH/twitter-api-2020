const db = require('../../models')
const socket = require('../../socket/socket')
const Message = db.Message
const User = db.User

let socketController = {
}
module.exports = socketController