import { useState, useEffect } from 'react'
import personService from './services/persons'


const Person = (props) => {
  const person = props.person
  return (
    <li>{person.name} {person.number} <button onClick={() => props.deletePerson(person.id, person.name)}>delete</button> </li>
  )
}

const Persons = (props) => {
  const newPersons = props.persons.filter(element => element.name.toUpperCase().includes(props.filter.toUpperCase()))
  return (
    newPersons.map(person => <Person key={person.name} person={person} deletePerson={props.deletePersonById} />)
  )
}

const PersonForm = (props) => (
  <form onSubmit={props.onSubmit}>
    <div>
      {props.nameText}: <input value={props.nameValue} onChange={props.nameOnChange} />
    </div>
    <div>
      {props.numberText}: <input value={props.numberValue} onChange={props.numberOnChange} />
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
)

const Filter = (props) => (
  <div>
    filter shown with: <input value={props.value} onChange={props.onChange} />
  </div>
)

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  const errorStyle = {
    color: 'green',
    background: 'lightgreen',
    fontSize: '15px',
    borderStyle: 'solid',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '10px'
  }

  return (
    <div style={errorStyle} >
      {message}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newFilter, setNewFilter] = useState('')
  const [statusMessage, setStatusMessage] = useState(null)


  const hook = () => {
    console.log('effect')
    personService
      .getAll()
      .then(allPersons => {
        console.log('promise fulfilled')
        setPersons(allPersons)
      })
  }

  useEffect(hook, [])
  console.log('render', persons.length, 'persons')

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setNewFilter(event.target.value)
  }

  const addNumber = (event) => {
    event.preventDefault()
    const personObject = {
      name: newName,
      number: newNumber
    }
    if (!persons.find(element => element.name === newName)) {
      personService.create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setNewName('')
          setNewNumber('')
          setStatusMessage(
            `Added ${returnedPerson.name}`
          )
          setTimeout(() => {
            setStatusMessage(null)
          }, 5000)
        })
        .catch(error => {
          setStatusMessage(error.response.data.error)
        })
    } else {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const oldPerson = persons.find(element => element.name === newName)
        personService
          .update(oldPerson.id, personObject)
          .then(returnedPerson => {
            setPersons(persons.map(element => element.id !== oldPerson.id ? element : returnedPerson))
            setNewName('')
            setNewNumber('')
            setStatusMessage(
              `${returnedPerson.name} number changed`
            )
            setTimeout(() => {
              setStatusMessage(null)
            }, 5000)
          })
          .catch(error => {
            // eslint-disable-next-line
            const deletedPerson = persons.find(element => element.name === newName)
            setStatusMessage(error.response.data.error)
            setTimeout(() => {
              setStatusMessage(null)
            }, 5000)
          })
      }
    }
  }

  const deletePersonById = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      personService
        .remove(id)
        .then(response => {
          setPersons(persons.filter(n => n.id !== id))
          setStatusMessage(
            `Deleted ${name}`
          )
          setTimeout(() => {
            setStatusMessage(null)
          }, 5000)
        })
    }
  }


  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={statusMessage} />
      <Filter value={newFilter} onChange={handleFilterChange} />
      <h2>add a new</h2>
      <PersonForm onSubmit={addNumber} nameText="name" nameValue={newName} nameOnChange={handleNameChange}
        numberText="number" numberValue={newNumber} numberOnChange={handleNumberChange} />
      <h2>Numbers</h2>
      <ul>
        <Persons persons={persons} filter={newFilter} deletePersonById={deletePersonById} />
      </ul>
    </div>
  )

}

export default App