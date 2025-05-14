//import DisplayGroups from './Components/Groups';
import { Routes, Route } from 'react-router-dom';

import GroupList from './Components/Groups';
import GroupDetail from './Components/Group';

import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<GroupList />} />
      <Route path="/group-info" element={<GroupDetail />} />
    </Routes>
  );
}

export default App;