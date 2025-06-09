const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const  bodyParser = require('body-parser')
const dtnv = require('dotenv')

dtnv.config()

const PORT = process.env.PORT
const CIFRA = process.env.CIFRA

const mockUser = {
    id:1,
    email:'user@exemplo.com',
    password: bcrypt.hashSync('123456',8)
}

const app = express();
app.use(cors())
app.use(bodyParser.json())

app.get('/api', (req, res)=>{
    res.send('API funcionando')
})


const getAuth = (req, res, next) => {
    console.log("getAuth middleware")
    const auth = req.headers.authorization
    const token = auth && auth.split(' ')[1]

    console.log('token', token)

    if (!token){
        console.log("Unauthorized") 
        return res.sendStatus(401)
    }

    jwt.verify(token, CIFRA, (error, mockUser)=>{
        if (error){
            console.log("Forbiden")
            return res.sendStatus(403)
        }

        req.mockUser = mockUser
        next()
    })

}

app.post('/login', (req, res)=>{
    console.log("login route")
    const {email, password} = req.body
    
    
    if (email !== mockUser.email){
        console.log("Email errado")
        return res.status(401).json({message: 'Email e senha não conferem'})
    }
    
    const passwordOk = bcrypt.compareSync(password, mockUser.password)
    if (!passwordOk){
        console.log("senha errada")
        return res.status(401).json({message: 'Email e senha não conferem'})
    }

    console.log("Token created")
    const token = jwt.sign({id: mockUser.id}, CIFRA, {expiresIn:'5m'})
    return res.status(200).json({token})

})

app.get('/auth', getAuth, (req, res)=>{
    console.log("auth route")
    res.status(200).json({message:'Bem Vindo!', user:req.mockUser})
})



app.listen(PORT, ()=>{
    console.log('Servidor rodando na porta: ', PORT)
})