import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function DisplayGroups() {
  const [groups, setGroups] = useState([]);
  const [status, setStatus] = useState(true);
  const [title, setTitle] = useState('');

  const navigate = useNavigate();

  const changeToInformationPage = (groupName) => {
    const index = groups.findIndex(group => group.groupName === groupName);
    if (index !== -1) {
      navigate(`/group-info/${groupName}`, {
        state: { group: groups[index] },
      });
    }
  };

  const getData = async () => {
      const { data } = await axios.get("https://localhost:7076/api/Group");
      console.log(data);    

      const groupsWithArrayMembers = data.map(group => ({
        ...group,
        members: group.members.split(",").map(name => name.trim()),
      }));

      setGroups(groupsWithArrayMembers);
  };

  useEffect(() => {
    getData();
  }, []);

  const addGroup = (title) => {
    const newGroup = {
      groupName: title,
      members: "",
      oweMoney: "empty"
    }
    axios.post("https://localhost:7076/api/Group", newGroup);
    getData();
    setGroups(prevGroups => [...prevGroups, newGroup]);
  };

  return (
    <div>
      <div className='groups-container'>
        {groups.map((group, index) => (
          <div key={index} className='group-row'>
            <div>Group name: {group.groupName}</div>
            <div>Group money: {group.oweMoney}</div>
            <button onClick={() => changeToInformationPage(group.groupName)}>Info</button>
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
            setTitle(''); // clear input after adding
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

