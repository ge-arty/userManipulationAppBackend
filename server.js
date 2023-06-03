const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv').config()
const dbConnect = require('./config/dbConnect')
const authRouts = require('./router/authRouts')
const { notFound, errorHandler } = require('./middlewares/error/errorHandler')


const app = express()
app.use(cors())



dbConnect()
app.use(express.json())

app.use('/api/auth', authRouts)

const PORT = process.env.PORT


app.use(notFound)
app.use(errorHandler)

app.listen(PORT, console.log(`Server listening on port: ${PORT}`))