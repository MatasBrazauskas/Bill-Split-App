import { useState } from 'react'
import DisplayGroups from './Components/Groups';
import './App.css'

function App() {
  
  const [data, setData] = useState([]);



  return (
    <DisplayGroups />
  )
}

export default App
