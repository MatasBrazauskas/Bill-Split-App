import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function Group() {
    const { id } = useParams();

    const [members, setMembers] = useState(null);
    const [groupsInfo, setGroupsInfo] = useState({});

    const [addName, setAddName] = useState("");
    const [newMoney, setNewMoney] = useState("");
    const [addMemberState, setAddMemberState] = useState(false);

    const [distributeMoney, setDistributeMoney] = useState(false);
    const [inDebt, setInDebt] = useState(false);

    const addNewPayer = async (name) => {
        const newPayer = { groupId: id, name, inDepth: (inDebt) ? '1' : '0', owedAmount: 0 };
        setInDebt(false);
        const response = await axios.post(`https://localhost:7076/api/App/members/${id}`, newPayer);
        console.log(response.data);
        setMembers(updated => [...updated, response.data]);
    };

    const getData = async () => {
        const { data } = await axios.get(`https://localhost:7076/api/App/member/${id}`);
        setMembers(data);

        const response  = await axios.get(`https://localhost:7076/api/App/group/${id}`);
        setGroupsInfo(response.data);

        console.log(data);
        console.log(response.data);
    };

    const changeGroupsMoney = async (money) => {
        let updatedGroup = { ...groupsInfo, oweMoney: money };
        //console.log(updatedGroup);   
        const response = await axios.put(`https://localhost:7076/api/App/group/${id}`, updatedGroup);
            
        setGroupsInfo(updatedGroup);
        setNewMoney("");
        //console.log(updatedGroup);
    };

    useEffect(() => {
        getData();
    }, [id]);

    if(groupsInfo === null || members === null) {
        return <div className="container mt-4">Loading...</div>;
    }

    return (
        <div className="container mt-4">
            <div className="card mb-4">
                <div className="card-body">
                    <h2 className="card-title">Group Name: {groupsInfo.groupName}</h2>
                    <p className="card-text">Money To Pay: {groupsInfo.oweMoney}</p>
                </div>
            </div>

            {groupsInfo.oweMoney <= 0 ? (
                <div className="card">
                    <div className="card-body">
                        <div className="input-group mb-3">
                            <input 
                                type='text' 
                                className="form-control"
                                placeholder='Enter Money To Pay' 
                                onChange={(e) => setNewMoney(e.target.value)}
                            />
                            <button 
                                className="btn btn-primary"
                                onClick={() => changeGroupsMoney(newMoney)}
                            >
                                Change Money To Pay
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="card-body">
                        <h3 className="card-title mb-4">List Of Group Members:</h3>

                        {members.map((obj, i) => (
                            <div key={i} className="card mb-3">
                                <div className="card-body">
                                    <h5 className="card-title">Name: {obj.name}</h5>
                                    <p className="card-text">
                                        {obj.inDepth === '1' ? 'In Debt' : 'Not In Debt'}: {obj.owedAmount}
                                    </p>

                                    {distributeMoney && (
                                        <div className="input-group">
                                            <input 
                                                type='text' 
                                                className="form-control"
                                                placeholder='Enter Money To Distribute'
                                            />
                                            <button className="btn btn-success">Distribute Money</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="mt-4">
                            {(!distributeMoney) ? (
                                <div className="d-flex gap-2">
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => {
                                            setAddName("");
                                            setAddMemberState(true);
                                        }}
                                    >
                                        Add Member
                                    </button>

                                    <button 
                                        className="btn btn-success"
                                        onClick={() => setDistributeMoney(true)}
                                    >
                                        Distribute Money
                                    </button>
                                </div>
                            ) : null}

                            {addMemberState && (
                                <div className="card mt-3">
                                    <div className="card-body">
                                        <div className="input-group mb-3">
                                            <input
                                                type='text'
                                                className="form-control"
                                                value={addName}
                                                onChange={(e) => setAddName(e.target.value)}
                                                placeholder='Enter Member Name'
                                            />
                                        </div>
                                        <div className="form-check mb-3">
                                            <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                id="inDebtCheck"
                                                onChange={() => setInDebt(i => !i)}
                                            />
                                            <label className="form-check-label" htmlFor="inDebtCheck">
                                                In Debt
                                            </label>
                                        </div>
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => {
                                                addNewPayer(addName);
                                                setAddName("");
                                                setAddMemberState(false);
                                            }}
                                        >
                                            Add Member
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Group;