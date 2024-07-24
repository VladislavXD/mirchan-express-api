const {prisma} = require('../prisma/prisma-client')
const bcrypt = require('bcryptjs')
const Jdenticon = require('jdenticon')
const path = require('path')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const { error } = require('console')



const UserController = {
    register: async (req, res) => {
        const {name, password, email} = req.body;

        if (!email || !password || !name){
            return res.status(400).json({erro: "Заполните все поля"})
        }

        try{
            const userExists = await prisma.user.findUnique({where: {email}});

            if (userExists){
                return res.status(400).json({error: 'Данный пользователь существует'})
            }

            const passHash = await bcrypt.hash(password, 10)

            const png = Jdenticon.toPng(name, 200)
            const avatarName = `${name}_${Date.now()}.png`
            const avatarPath = path.join(__dirname, '/../uploads', avatarName)
            fs.writeFileSync(avatarPath, png)

            const user = await prisma.user.create({
                data: {
                    email,
                    password: passHash,
                    name,
                    avatarUrl: `/uploads/${avatarName}`
                }
            })

            res.json(user)
        }catch(err){
            console.log('Something went Errror in register ', err);
            res.status(500).json({error: 'Internal server error'})
        }
    },

    login: async (req, res) => {
        const {email, password} = req.body;

        if (!email || !password){
            return res.status(401).json({error: 'Заполните все поля'})
        }

        try{
            // проверка почты
            const user = await prisma.user.findUnique({where: {email}})
            if (!user){
                return res.status(400).json({error: 'Неверный логин или пароль'})
            }

            // проверка пароля
            const valid = await bcrypt.compare(password, user.password)
            if (!valid){
                return res.status(400).json({error: 'Неверный логин или пароль'})
            }

            // jwt token
            const token = jwt.sign(({userId: user.id}), process.env.SECRET_KEY)
            
            res.json({token})

        }catch(err){
            console.log("Login Error", err);

            res.status(500).json({error: "Internal server error"})
        }
    },
    getUserById: async (req, res) => {
        const {id} = req.params;
        const userId = req.user.userId

        try{
            const user = await prisma.user.findUnique({
                where: {id},
                include: {
                    post: true,
                    followers: true,
                    following: true
                }
            })

            if(!user){
                return res.status(400).json({error: 'Пользователь не найден'})
            }

            const isFolow = await prisma.follows.findFirst({
                where: {
                    AND: [
                        {followerId: userId},
                        {followingId: id}
                    ]
                }
            })

            res.json({...user, isFolow: Boolean(isFolow)})

        }catch(err){
            console.log('Get current error ', err);

            res.status(500).json({error: "Internal server error"})
        }

    },
    updateUser: async (req, res) => {
        const {id} = req.params ;
        const {email, name, dateOfBirth, bio, location} = req.body;

        let filePath;
        if (req.file && req.file.path){
            filePath = req.file.path;
        }
        console.log(req.user);
        if (id !== req.user.userId){
            return res.status(403).json({error: 'Нет доступа'})
        }


        try{
            if (email){
                const existingUser = await prisma.user.findFirst({
                    where: {email: email}
                })
                if (existingUser && existingUser.id !== id){
                    return res.status(400).json({error: 'почта уже используется'})
                }

            }

            const user = await prisma.user.update({
                where: {id},
                data: {
                    email: email || undefined,
                    name: name || undefined,
                    avatarUrl: filePath ? `/${filePath}` : undefined,
                    dateOfBirth: dateOfBirth || undefined,
                    bio: bio || undefined,
                    location: location || undefined
                }
            })
            res.json(user)

        }catch(err){
            console.log("error user update ", err);
            res.status(401).json({error:  'Internal server error'})
        }

    },
    currentUser: async (req, res) => {
        try{
            const user = await prisma.user.findUnique({
                where: {
                    id: req.user.userId
                },
                include: {
                    followers: {
                        include: {
                            follower: true
                        }
                    },
                    following: {
                        include: {
                            following: true
                        }
                    }
                }

            })

            if (!user){
                return res.status(400).json({error: 'Не удалось найти пользователя'})
            }
            res.json(user)
        }catch(err){
            console.log("get cuttent error",err);
            res.status(500).json({error: 'Internal server error'})
        }

    },
    
}






module.exports = UserController;