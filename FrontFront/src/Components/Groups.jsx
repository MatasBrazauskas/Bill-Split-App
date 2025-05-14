import React , { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

const getData = (setGroups) => {
    const arr = [
        {name: 'Group 1', money: 100},
        {name: 'Group 2', money: 200},
        {name: 'Group 3', money: 300},
    ];
    setGroups(temp => [...arr]);
}

const addGroup = (title, setGroups) => {
    setGroups(temp => [...temp, {name: title, money: 0}]);
}

function DisplayGroups()
{
    const [groups, setGroups] = useState([]);
    const [status, setStatus] = useState(true);
    const [title, setTitle] = useState('');

    useEffect(() => {
        !getData(setGroups);
    }, []);

      const navigate = useNavigate();

  const changeToInformationPage = (groupName) => {
    const index = groups.findIndex(group => group.name === groupName);
    navigate(`/group-info${groupName}`, 
        {state: {
        id: groups[index],
    }
    });
  };

    return (
    <div>
        <div className = 'groups-container'>
            {groups.map((group, index) => {
                return (
                <div key = {index} className = 'group-row'>
                    <div >Groups name: {group.name}</div>
                    <div >Groups money: {group.money}</div>
                    <button onClick={() =>changeToInformationPage(group.name)}>Info</button>
                    <br></br>
                    <br></br>
                </div>
                );})}
        </div>
        {
        status ? 
        (<div className = 'add-groups'>
            <div>Add New Group</div>
            <button onClick={() => setStatus(i => !i)}>Add Group</button>
        </div>) : 
        (<div className = 'add-group-form'>
            <input type = 'text' placeholder = 'Group Name' onChange = {(e) => setTitle(e.target.value)}/>
            <button onClick={() => {setStatus(i => !i), addGroup(title, setGroups)}}>Add Group</button>
            <button onClick={() => {setStatus(i => !i), alert(title)}}>Cancel</button>
        </div>)}
    </div>
    );
}
export default DisplayGroups;

