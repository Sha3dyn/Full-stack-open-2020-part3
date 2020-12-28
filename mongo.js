const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
  `mongodb+srv://fullstackopen:${password}@cluster0.nvwpc.mongodb.net/puhelinluettelo?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const phonebookSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    unique: true,
    required: true
  },
  number: {
    type: String,
    minlength: 8,
    required: true
  }
});

phonebookSchema.plugin(uniqueValidator);

const Record = mongoose.model('Record', phonebookSchema)

/*const record = new Record({
  name: 'Arto Hellas',
  number: '040-123456',
})*/

if(process.argv.length<4) {
    console.log('phonebook:')
    Record.find({}).then(result => {
        result.forEach(record => {
            console.log(record.name + ' ' + record.number)
        })

        mongoose.connection.close()
    })
} else {
    const record = new Record({
        name: name,
        number: number
    })

    record.save().then(response => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
    })
}

