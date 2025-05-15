import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

function Group() {
    const location = useLocation();
    const [group, setGroup] = useState(location.state.group);

    const [editingIndex, setEditingIndex] = useState(null);
    const [newOwePay, setNewOwePay] = useState("");
    const [addName, setAddName] = useState("");

    const changeOwed = (index, newOwedValue) => {
        group.owe[index].owed = newOwedValue;
        setEditingIndex(null);
    }

    const addNewPayer = (name, setNewOwePay) => {
        setNewOwePay(temp => [...temp, { name: name, owed: 0 }]);
    }

    return (
        <div>
            <div>
                <div>Groups Name: {group.name}</div>
                <div>Money To Pay: {group.money}</div>
                <br />
                <div>List Of Groups Members:</div>

                {group.owe.map((obj, i) => (
                    <div key={i}>
                        <div>Name: {obj.name}</div>
                        <div>Owed: {obj.owed}</div>

                        {(obj.owed !== null && editingIndex === null) && (
                            <button onClick={() => setEditingIndex(i)}>
                                Change Owed Value
                            </button>
                        )}

                        {(editingIndex !== null && editingIndex === i) && (
                            <div className='add-group-form'>
                                <input
                                    type='text'
                                    placeholder='New Owed Value'
                                    value={newOwePay}
                                    onChange={(e) => setNewOwePay(e.target.value)}
                                />
                                <button onClick={() => changeOwed(i, newOwePay)}>Change Value</button>
                                <button onClick={() => setEditingIndex(null)}>Cancel</button>
                            </div>
                        )}
                        <br></br>
                        <br></br>
                    </div>
                ))}
            </div>
            <div>
                {addName === '' ?
                <div>
                <div>Add New Memeber</div>
                        <button onClick={() => addNewPayer(setGroup)}>Add Member</button>
                </div>
                :
                    <div>
                        <input type='text' onChange={(e) => setAddName(e.target.value)}></input>
                        <button onClick={() => { setAddName(""); addNewPayer(addName, setGroup) }}>Add Member</button>
                </div>
                }
            </div>
        </div>
    );
};

export default Group;

