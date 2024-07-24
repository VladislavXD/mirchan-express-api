const {prisma} = require('../prisma/prisma-client');



const FollowController = {
    followUser: async (req, res)=>{
        const {followingId} = req.body;

        const userId = req.user.userId;
        console.log(userId);
        if (followingId === userId){
            return res.status(500).json({error: 'Вы не можете подписаться на самого себя'})
        }

        try{
            const followExists = await prisma.follows.findFirst({
                where: {
                    AND: [
                        {followerId: userId},
                        {followingId}
                    ]
                }
            })
            if(followExists){
                return res.status(400).json({error: 'Вы уже подписаны'})
            }
            await prisma.follows.create({
                data: {
                    follower: {connect: {id: userId}},
                    following: {connect: {id: followingId}},
                }
            })
            res.status(201).json({message: "Вы успешно подписались"})
        }catch(err){    
            console.log('error from follow user', err);
            res.status(500).json({error: 'Internal server error'})
        }
    },

    unfollowUser: async (req, res) => {
        const {followingId} = req.body;
        const userId = req.user.userId;

        try{
            const follows = await prisma.follows.findFirst({
                where: {
                    AND: [
                        {followerId: userId},
                        {followingId}
                    ]
                }
            })
            if(!follows){
                return res.status(404).json({error: 'Вы не подписаны на этого пользовтеля'})
            }

            await prisma.follows.delete({
                where: {id: follows.id}
            })

            res.status(201).json({message: "Вы успешно отписались"})
            
        }catch(err){    
            console.log('error from unfollow user', err);
            res.status(500).json({error: 'Internal server error'})
        }
    }

}   

module.exports = FollowController