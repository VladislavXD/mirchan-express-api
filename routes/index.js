// import UserController from '../controllers';
const UserController = require ('../controllers/user-controller.js')
const express = require('express');
const router = express.Router();
const multer = require('multer');
const authenticateTokent = require('../middleware/auth.js');
const PostController = require('../controllers/post_controller.js');
const CommentController = require('../controllers/commetn_controller.js');
const LikeController = require('../controllers/like_controller.js');
const FollowController = require('../controllers/follow_controller.js');

const uploadDestination = 'uploads'


// показываем, где хранить  файлы
const storage = multer.diskStorage({
  destination: uploadDestination,
  filename: function(req, file, call) {
    call(null, file.originalname)
  }
});

const uploads = multer({storage: storage})





/* GET user route. */
router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/user/:id', authenticateTokent, UserController.getUserById)
router.get('/current', authenticateTokent, UserController.currentUser)
router.put('/user/:id', authenticateTokent, uploads.single('avatar'), UserController.updateUser)


// route posts
router.post('/posts', authenticateTokent, PostController.createPost)
router.get('/posts', authenticateTokent, PostController.GetAllPosts)
router.get('/posts/:id', authenticateTokent, PostController.GetPostById)
router.delete('/posts/:id', authenticateTokent, PostController.DeletePost)
router.delete('/posts/:id', authenticateTokent, PostController.GetPostByUserId)



// comment route
router.post('/comments', authenticateTokent, CommentController.createComment)
router.delete('/comments/:id', authenticateTokent, CommentController.deleteComment)




// like route
router.post('/likes', authenticateTokent, LikeController.likePost)
router.delete('/likes/:id', authenticateTokent, LikeController.unLikePost)


// follows route
router.post('/follow', authenticateTokent, FollowController.followUser)
router.delete('/follow/:id', authenticateTokent, FollowController.unfollowUser)

module.exports = router
