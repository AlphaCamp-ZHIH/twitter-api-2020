const db = require('../../models')
const User = db.User
const Tweet = db.Tweet
const Admin = db.Admin
const bcrypt = require('bcrypt-nodejs')
const jwt = require('jsonwebtoken')

let defaultLimit = 10

let adminController = {
  getUsers: (req, res) => {
    const options = {
      limit: +req.query.limit || defaultLimit,
      offset: +req.query.offset || 0,
      raw: true,
      attributes: { exclude: ['email', 'introduction', 'password', 'lastLoginAt', 'updatedAt', 'createdAt'] }
    }
    User.findAll(options)
      .then((users) => {
        users.forEach((user) => {
          if (user.introduction) {
            user.introduction = user.introduction.substring(0, 50)
          }
        })
        res.status(200).json(users)
      })
      .catch((error) => {
        res.status(500).json({ status: 'error', message: error })
      })
  },
  getTweets: (req, res) => {
    const options = {
      limit: +req.query.limit || defaultLimit,
      offset: +req.query.offset || 0,
      attributes: ['id', 'description', 'likeNum', 'replyNum', 'createdAt'],
      order: [['createdAt', 'desc']],
      include: [
        {
          model: User,
          attributes: ['id', 'account', 'name', 'avatar'],
          as: 'User'
        }
      ]
    }
    Tweet.findAll(options)
      .then((tweets) => {
        tweets.forEach((tweet) => {
          tweet.description = tweet.description.substring(0, 50)
        })
        return res.status(200).json(tweets)
      })
      .catch(() => res.status(500).json({ status: 'error', message: error }))
  },
  deleteTweet: (req, res) => {
    Tweet.findByPk(req.params.tweetId)
      .then((tweet) => tweet.destroy())
      .then(() =>
        res
          .status(200)
          .json({ status: 'success', message: 'Successfully delete tweet.' })
      )
      .catch(() =>
        res
          .status(500)
          .json({ status: 'error', message: error })
      )
  },
  login: (req, res) => {
    const { password, email } = req.body
    if (!password || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Password or email can not be empty.'
      })
    }

    User.findOne({ where: { email, role: 'admin' } })
      .then((user) => {
        if (!user) {
          return res
            .status(401)
            .json({ status: 'error', message: "This admin account doesn't exist." })
        }
        if (!bcrypt.compareSync(password, user.password)) {
          return res
            .status(401)
            .json({ status: 'error', message: 'Password incorrect.' })
        }

        let payload = {
          id: user.id
        }
        let token = jwt.sign(payload, process.env.JWT_SECRET)
        return res.status(200).json({
          status: 'success',
          message: 'Administrator successfully login.',
          token,
          User: {
            id: user.id,
            name: user.name,
            account: user.account,
            email: user.email
          }
        })
      })
      .catch((error) =>
        res.status(500).json({ status: 'error', message: error })
      )
  }
}

module.exports = adminController
