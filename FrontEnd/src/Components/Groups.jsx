import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import axios from 'axios';

function DisplayGroups() {
  const [groups, setGroups] = useState([]);
  const [status, setStatus] = useState(true);
  const [title, setTitle] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      const { data } = await axios.get("https://localhost:7076/api/App/group");
      setGroups(data);
    };
    getData();
  }, []);

  const changeToInformationPage = (index) => {
    const id = groups[index].id;
    navigate(`/group-info/${id}`);
  };

  const addGroup = async () => {
    const newGroup = { groupName: title, oweMoney: "0" };
    const response = await axios.post("https://localhost:7076/api/App/group", newGroup);
    setGroups(prev => [...prev, response.data]);
    setTitle('');
    setStatus(true);
  };

  const deleteGroup = async (id) => {
    await axios.delete(`https://localhost:7076/api/App/group/${id}`);
    setGroups(prev => prev.filter(group => group.id !== id));
  };

  return (
    <div className="container mt-4">
      <h3>Groups</h3>

      {groups.map((group, index) => (
        <div key={index} className="border p-2 mb-2">
          <div><strong>Name:</strong> {group.groupName}</div>
          <div><strong>Money:</strong> {group.oweMoney}</div>
          <button className="btn btn-sm btn-info me-2" onClick={() => changeToInformationPage(index)}>Info</button>
          <button className="btn btn-sm btn-danger" onClick={() => deleteGroup(group.id)}>Delete</button>
        </div>
      ))}

      {status ? (
        <div className="mt-4">
          <button className="btn btn-primary" onClick={() => setStatus(false)}>Add Group</button>
        </div>
      ) : (
        <div className="mt-4">
          <input
            className="form-control mb-2"
            placeholder="Group Name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="btn btn-success me-2" onClick={addGroup}>Submit</button>
          <button className="btn btn-secondary" onClick={() => setStatus(true)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default DisplayGroups;

