const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Person = require('../models/person')

const api = supertest(app)

const initialPersons = [
    {
        name: 'John Smith',
        number: '010-001001'
    },
    {
        name: 'Patrick Smith',
        number: '020-002002'
    },
]

beforeEach(async () => {
    await Person.deleteMany({})
    let personObject = new Person(initialPersons[0])
    await personObject.save()
    personObject = new Person(initialPersons[1])
    await personObject.save()
})

test('persons are returned as json', async () => {
  await api
    .get('/api/persons')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two persons', async () => {
    const response = await api.get('/api/persons')
  
    expect(response.body).toHaveLength(initialPersons.length)
  })

afterAll(() => {
  mongoose.connection.close()
})