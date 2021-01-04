require('dotenv').config()
const express = require('express')
const { response } = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Record = require('./models/record')

app.use(express.static('build'))
app.use(cors())
app.use(express.json())

//app.use(morgan('tiny'))

morgan.token('content', function(req) { return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))

/*
const randomId = () => {
  const generatedId = Math.floor(Math.random() * 10001)

  return generatedId
}
*/

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons/:id', (req, res, next) => {
  Record.findById(req.params.id)
  .then(record => {
    if(record) {
      res.json(record)
    } else {
      res.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Record.findByIdAndRemove(req.params.id)
  .then(result => {
    res.status(204).end()
  })
  .catch(error => next(error))
}) 

app.get('/info', (req, res, next) => {
  const responseTime = new Date();

  Record.find({}).then(record => {
    res.send(`Phonebook has info for ${record.length} people<br><br>${responseTime}`)
  }).catch(error => next(error))
}) 

app.get('/api/persons', (req, res, next) => {
    Record.find({}).then(persons => {
      res.json(persons)
    }).catch(error => next(error)) 
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if(body === undefined) {
    res.statusMessage = 'Person undefined'
    res.status(400).end()
  }

  //if(!body.name) {
  //  return res.status(400).json({
  //    error: 'name missing'
  //  })
  //}

  //if(!body.number) {
  //  return res.status(400).json({
  //    error: 'number missing'
  //  })
  //}

  const record = new Record({
    name: body.name,
    number: body.number,
    //id: randomId()
  })

  record.save().then(savedRecord => {
    res.json(savedRecord)
  }).catch((error) => next(error))
});

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  
  const record = {
    name: body.name,
    number: body.number,
  }

  Record.findByIdAndUpdate(req.params.id, record, {new: true, runValidators: true, context: 'query'})
  .then(updatedRecord => {
    res.json(updatedRecord.toJSON())
  })
  .catch(error => (next(error)))
})

const errorHandler = (error, req, res, next) => {
  if(error.name === 'castError') {
    return res.status(400).send({ error: 'malformatted id'})
  } else if(error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
