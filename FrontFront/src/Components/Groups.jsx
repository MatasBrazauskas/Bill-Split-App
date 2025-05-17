import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function DisplayGroups() {
  const [groups, setGroups] = useState([]);
  const [status, setStatus] = useState(true);
  const [title, setTitle] = useState('');

  const navigate = useNavigate();

  const changeToInformationPage = (index) => {
    const id = groups[index].id;
      navigate(`/group-info/${id}`);//, { state: { group: groups[index] } });
  };

  const getData = async () => {
  const { data } = await axios.get("https://localhost:7076/api/App");

  const groupsWithArrayMembers = data.map(group => ({
    ...group,
  }));

  setGroups(groupsWithArrayMembers);
};

  useEffect(() => {
    getData();
  }, []);

  const addGroup = async (title) => {
  const newGroup = {
    groupName: title,
    oweMoney: "0"
  };
  const response = await axios.post("https://localhost:7076/api/App/group", newGroup);
  setGroups(prevGroups => [...prevGroups, response.data]);
};

  const deleteGroup = async (id) => {
  try {
    await axios.delete(`https://localhost:7076/api/App/group/${id}`);
    setGroups(prevGroups => prevGroups.filter(group => group.id !== id));
  } catch (error) {
    console.error("Failed to delete group:", error);
  }
};

  return (
    <div>
      <div className='groups-container'>
        {groups.map((group, index) => (
          <div key={index} className='group-row'>
            <div>Group name: {group.groupName}</div>
            <div>Group money: {group.oweMoney}</div>
            <button onClick={() => changeToInformationPage(index)}>Info</button>
            <button onClick={() => deleteGroup(group.id)}>Delete Group</button>
            <br /><br />
          </div>
        ))}
      </div>

      {status ? (
        <div className='add-groups'>
          <div>Add New Group</div>
          <button onClick={() => setStatus(false)}>Add Group</button>
        </div>
      ) : (
        <div className='add-group-form'>
          <input
            type='text'
            placeholder='Group Name'
            onChange={(e) => setTitle(e.target.value)}
            value={title}
          />
          <button onClick={() => {
            addGroup(title);
            setStatus(true);
            setTitle('');
          }}>
            Add Group
          </button>
          <button onClick={() => setStatus(true)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default DisplayGroups;

