//import DisplayGroups from './Components/Groups';
import { Routes, Route } from 'react-router-dom';

import GroupList from './Components/Groups.jsx';
import GroupDetail from './Components/Group.jsx';
import NewTransaction from './Components/New Transaction.jsx';
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<GroupList />} />
      <Route path="/group-info/:id" element={<GroupDetail />} />
      <Route path="/transactions/:id" element={<NewTransaction />} />
    </Routes>
  );
}

export default App;