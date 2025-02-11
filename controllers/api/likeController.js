const db = require('../../models')
const Like = db.Like
const User = db.User
const Tweet = db.Tweet
const TimelineRecord = db.TimelineRecord
const defaultLimit = 10

let likeController = {
  getLikes: (req, res) => {
    const options = {
      limit: +req.query.limit || defaultLimit,
      offset: +req.query.offset || 0,
      where: {
        TweetId: +req.params.tweetId,
      },
      attributes: [],
      include: [
        {
          model: User,
          attributes: ['id', 'account', 'name', 'avatar'],
          order: [['followerNum', 'DESC']],
        },
      ],
      order: [['createdAt', 'DESC']],
    }
    Like.findAll(options)
      .then((likes) => {
        likes = likes.map((like) => like.User)
        res.status(200).json(likes)
      })
      .catch((error) =>
        res
          .status(500).json({
            status: 'error',
            message: error
          }))
  },
  postLike: (req, res) => {
    Promise.all([
      Tweet.findByPk(+req.params.tweetId),
      Like.findOne({
        where: {
          UserId: +req.user.id,
          TweetId: +req.params.tweetId
        }
      })
    ]).then(result => {
      if (!result[0]) {
        return res
          .status(404)
          .json({
            status: 'error',
            message: 'Tweet not found.'
          })
      }
      if (result[1]) {
        return res.status(400).json({
          status: 'error',
          message: 'You already liked this tweet.'
        })
      }
      Like.create({
        UserId: +req.user.id,
        TweetId: +req.params.tweetId
      })
        .then((like) => {
          //Tweet likeNum +1 & User likeNum +1
          Promise.all([
            Tweet.findByPk(+req.params.tweetId)
              .then((tweet) =>
                tweet.increment({ likeNum: 1 })
              ),
            User.findByPk(+req.user.id)
              .then((user) =>
                user.increment({ likeNum: 1 })
              )
          ])
            .then(() =>
              res.status(200).json({
                status: 'success',
                message: 'Successfully liked tweet.',
                Like: like
              })
            )
            .catch((error) =>
              res.status(500).json({
                status: 'error',
                message: error
              })
            )
        })
    })
  },
  deleteLike: (req, res) => {
    Like.findOne({
      where: {
        TweetId: +req.params.tweetId,
        UserId: +req.user.id
      }
    })
      .then(async (Like) => {
        if (!Like) {
          return res.status(400).json({
            status: 'error',
            message: 'This Like does not exist.'
          })
        }
        await TimelineRecord.destroy({
          where: {
            LikeId: Like.id
          }
        })
        Like.destroy().then(() => {
          Promise.all([
            Tweet.findByPk(+req.params.tweetId)
              .then((tweet) =>
                tweet.decrement({ likeNum: 1 })
              ),
            User.findByPk(+req.user.id)
              .then((user) =>
                user.decrement({ likeNum: 1 })
              )
          ])
            .then(() =>
              res.status(200).json({
                status: 'success',
                message: 'Successfully unliked tweet.'
              })
            )
            .catch((error) =>
              res.status(500).json({
                status: 'error',
                message: error
              })
            )
        }
        )
      }
      )
      .catch((error) =>
        res.status(500).json({
          status: 'error',
          message: error
        })
      )
  },
  getUserLikes: (req, res) => {
    const options = {
      limit: +req.query.limit || defaultLimit,
      offset: +req.query.offset || 0,
      order: [['createdAt', 'desc']],
      attributes: ['id', 'UserId', 'TweetId', 'createdAt'],
      where: { UserId: +req.params.id },
      include: {
        model: Tweet,
        as: 'LikedTweet',
        include: [
          {
            model: User,
            as: 'Author',
            attributes: ['id', 'name', 'account', 'avatar']
          },
          {
            model: User,
            as: 'LikedUsers',
            attributes: ['id'],
            through: {
              attributes: []
            }
          }
        ],
        attributes: ['id', 'description', 'likeNum', 'replyNum', 'createdAt']
      }
    }
    Like.findAll(options)
      .then(likes => {
        likes = likes.map(like => {
          like.LikedTweet.dataValues.isLike = like.LikedTweet.dataValues.LikedUsers.some(
            (likedUser) => likedUser.id === +req.user.id
          )
          delete like.LikedTweet.dataValues.LikedUsers
          return like
        })
        return res.status(200).json(likes)
      })
      .catch((error) =>
        res.status(500).json({
          status: 'error',
          message: error
        })
      )
  }
}

module.exports = likeController
