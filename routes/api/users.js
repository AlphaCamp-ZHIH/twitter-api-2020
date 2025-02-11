const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const imageFields = [
  { name: 'avatar', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]
const userController = require('../../controllers/api/userController')
const likeController = require('../../controllers/api/likeController')
const followController = require('../../controllers/api/followController')
const tweetController = require('../../controllers/api/tweetController')
const replyController = require('../../controllers/api/replyController')
const { authenticated, authenticatedUser } = require('../../middleware/auth')

router.post('/login', userController.login)
router.post('/', userController.postUser)

router.use(authenticated)

router.get('/current_user', userController.getCurrentUser)

router.use(authenticatedUser)

router.get('/', followController.getNotFollowingUsers)
router.get('/:id', userController.getUser)
router.put('/:id', upload.fields(imageFields), userController.putUser)
router.get('/:id/followings', followController.getUserFollowings)
router.get('/:id/followers', followController.getUserFollowers)
router.get('/:id/tweets', tweetController.getUserTweets)
router.get('/:id/replied_tweets', replyController.getRepliedTweets)
router.get('/:id/likes', likeController.getUserLikes)

module.exports = router
