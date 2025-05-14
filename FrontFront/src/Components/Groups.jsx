import React , { useState, useEffect} from 'react';

const getData = (setGroups) => {
    const arr = [
        {name: 'Group 1', money: 100},
        {name: 'Group 2', money: 200},
        {name: 'Group 3', money: 300},
    ];
    setGroups(temp => [...arr]);
}

function DisplayGroups()
{
    const [groups, setGroups] = useState([]);
    const [status, setStatus] = useState(true);
    const [title, setTitle] = useState('');

    useEffect(() => {
        !getData(setGroups);
    }, []);

    return (
    <div>
        <div className = 'groups-container'>
            {groups.map((group, index) => {
                return (
                <div key = {index}className = 'group-row'>
                    <div >{group.name}</div>
                    <div >{group.money}</div>
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
            <button>Add Group</button>
            <button onClick={() => {setStatus(i => !i), alert(title)}}>Cancel</button>
        </div>)}
    </div>
    );
}
export default DisplayGroups;

