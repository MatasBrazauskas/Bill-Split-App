import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Group() {
    const { id } = useParams();

    const [members, setMembers] = useState(null);
    const [groupsInfo, setGroupsInfo] = useState({});

    const [addName, setAddName] = useState("");
    const [newMoney, setNewMoney] = useState("");
    const [addMemberState, setAddMemberState] = useState(false);

    const [distributeMoney, setDistributeMoney] = useState(false);
    const [inDebt, setInDebt] = useState(false);

    const navigate = useNavigate();

    const addNewPayer = async (name) => {
        const newPayer = { name, inDepth: inDebt ? "1" : "0", owedAmount: 0 };
        setInDebt(false);

        const response = await axios.post(`https://localhost:7076/api/App/members/${id}`,newPayer);
        setMembers((updated) => [...updated, response.data]);
    };

    const deletePlayer = async (obj) => {
        await axios.delete(
            `https://localhost:7076/api/App/members/${obj.groupId}/${obj.name}`
        );
        setMembers((updated) =>
            updated.filter((member) => member.name !== obj.name)
        );
    };

    const getData = async () => {
        const { data } = await axios.get(
            `https://localhost:7076/api/App/members/${id}`
        );
        setMembers(data);

        const response = await axios.get(
            `https://localhost:7076/api/App/group/${id}`
        );
        setGroupsInfo(response.data);
    };

    const changeGroupsMoney = async (money) => {
        const updatedGroup = { ...groupsInfo, oweMoney: money };
        const response = await axios.put(
            `https://localhost:7076/api/App/group/${id}`,
            updatedGroup
        );

        setGroupsInfo(updatedGroup);
        setNewMoney("");
    };

    const setOweMoney = async (obj) => {
        const responce = await axios.put(
            `https://localhost:7076/api/App/members/update?groupId=${id}&name=${obj.name}&newValue=${newMoney}`
        );

        setMembers((updated) =>
            updated.map((member) =>
                member.name === obj.name ? { ...member, owedAmount: newMoney } : member
            )
        );
        setNewMoney("");
    };

    const distributeMoneyEqually = async () => {
        const response = await axios.post(`https://localhost:7076/api/App/members/equally/${id}`, groupsInfo.oweMoney);
        getData();
    };

    const [payAmount, setPayAmount] = useState(0);
    const [getAmount, setGetAmount] = useState(0);

    useEffect(() => {
        const fetchSums = async () => {
            const pay = await axios.get(
                `https://localhost:7076/api/App/members/payers_sum/${id}`
            );
            const get = await axios.get(
                `https://localhost:7076/api/App/members/owner_sum/${id}`
            );
            setPayAmount(pay.data);
            setGetAmount(get.data);
        };
        fetchSums();
        console.log(payAmount);
        console.log(getAmount);
    }, [distributeMoney]);

    useEffect(() => {
        getData();
    }, [id]);

    if (groupsInfo === null || members === null) {
        return <div className="container mt-4">Loading...</div>;
    }

    return (
        <div className="container mt-4">
            <div className="card mb-4">
                <div className="card-body">
                        <button className="btn btn-danger" onClick={() => navigate('/')}>
                            Go Back To Groups Page
                        </button>
                    <h2 className="card-title">Group Name: {groupsInfo.groupName}</h2>
                    <p className="card-text">Money To Pay: {groupsInfo.oweMoney}</p>
                </div>
            </div>

            {parseInt(groupsInfo.oweMoney) <= 0 ? (
                <div className="card">
                    <div className="card-body">
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter Money To Pay"
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
                                        {obj.inDepth === "1" ? "In Debt" : "Not In Debt"}:{" "}
                                        {obj.owedAmount}
                                    </p>

                                    {distributeMoney && (
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter Money To Distribute"
                                                onChange={(e) => setNewMoney(e.target.value)}
                                            />
                                            {parseInt(obj.owedAmount) <= 0 ? (
                                                <div className="d-flex gap-2">
                                                    {console.log(obj.owedAmount)}
                                                    <button
                                                        className="btn btn-success"
                                                        onClick={() => setOweMoney(obj)}
                                                    >
                                                        Distribute Money
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>Money Is Set!</div>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        className="btn btn-danger"
                                        onClick={() => deletePlayer(obj)}
                                    >
                                        Delete Player
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div>
                            <div>Amount of money will be payed: {payAmount}</div>
                            <div>Amount of money will be geted: {getAmount}</div>
                        </div>

                        {distributeMoney && 
                        <div>
                            <div>How To Distribute Money?</div>
                            <button className="btn btn-succses" onClick={() => distributeMoneyEqually()}>Equally</button>
                            <button className="btn btn-success">Percentage</button>
                            <button className="btn btn-succses">Dynamic</button>
                            <button className="btn btn-danger" onClick={() => setDistributeMoney(false)}>Cancel</button>
                        </div>
                        }

                        <div className="mt-4">
                            {!distributeMoney ? (
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
                                                type="text"
                                                className="form-control"
                                                value={addName}
                                                onChange={(e) => setAddName(e.target.value)}
                                                placeholder="Enter Member Name"
                                            />
                                        </div>
                                        <div className="form-check mb-3">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="inDebtCheck"
                                                onChange={() => setInDebt((i) => !i)}
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
