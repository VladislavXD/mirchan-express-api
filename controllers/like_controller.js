const {prisma} = require('../prisma/prisma-client')

const LikeController = {
    likePost: async (req, res) => {
        const {postId} = req.body;

        const userId = req.user.userId;

        if(!postId){
            return res.status(400).json({error: 'Все поля обязательны'})
        }

        try{
            const likeExists = await prisma.like.findFirst({
                where: {postId, userId}
            })

            if(likeExists){
                return res.status(400).json({error: ' Вы уже поставили лайк'})
            }

            const like = await prisma.like.create({
                data: {postId, userId}
            })
            res.json(like)
        }catch(err){
            console.log("error from like post", err);
            res.status(500).json({error: 'Internal server error'})
        }
    },
    unLikePost: async (req, res) => {
        const {id} = req.params;
        const userId = req.user.userId;

        if (!id){
            return res.status(400).json({error: 'Нельзя ставить дизлайк'})
        }
        try{
            const likeExists = await prisma.like.findFirst({
                where: {postId: id, userId}
            })

            if (!likeExists){
                return res.status(400).json({error: 'Лайк уже стоит'})
            }

            const like = await prisma.like.deleteMany({
                where: {postId: id, userId}
            })
            res.json(like)

        }catch(err){
            console.log("error from unLike post", err);
            res.status(500).json({error: 'Internal server error'})
        }
    },
}

module.exports = LikeController