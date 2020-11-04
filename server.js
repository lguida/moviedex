require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const MOVIEDEX = require('./store.json')

const app = express()

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'
app.use(morgan(morganSetting))
app.use(helmet())
app.use(cors())

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const bearerToken = req.get("Authorization")

    if (!bearerToken || bearerToken.split(' ')[1] !== apiToken){
        return res.status(401).json({ error: 'Unauthorized request' })
    }

    next()
})

app.get('/movie', function handleGetMovies(req, res){
    const { genre, country, avg_vote } = req.query

    let result = MOVIEDEX

    if (genre){
        result = result.filter(movie =>
            movie.genre.toLowerCase().includes(genre.toLowerCase()))
    } 

    if (country){
        result = result.filter(movie =>
            movie.country.toLowerCase().includes(country.toLowerCase()))
    }

    if (avg_vote){
        result = result.filter(movie =>
            movie.avg_vote >= Number(avg_vote))
    }

    if (result.length === 0 ){
        result = 'Sorry, there are no entries matching those parameters'
    }

    res.json(result)
})

app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'production') {
      response = { error: { message: 'server error' }}
    } else {
      response = { error }
    }
    res.status(500).json(response)
})

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {})