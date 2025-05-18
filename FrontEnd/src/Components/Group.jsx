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

    // 0 - equaly, 1 - procent, 2- dynamic
    const [distributionIndex, setDistributionIndex] = useState(-1);

    const [payAmount, setPayAmount] = useState(0);
    const [getAmount, setGetAmount] = useState(0);
    const [finalize, setFinalize] = useState(false);

    const addNewPayer = async (name) => {
        const newPayer = { name, inDepth: inDebt ? "1" : "0", owedAmount: 0 };
        setInDebt(false);

        const response = await axios.post(`https://localhost:7076/api/App/members/${id}`, newPayer);
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
        const mem = await axios.get(`https://localhost:7076/api/App/members/${id}`);
        setMembers(mem.data);

        const response = await axios.get(`https://localhost:7076/api/App/group/${id}`);
        setGroupsInfo(response.data);
        console.log(id);

        const finalized = await axios.get(`https://localhost:7076/api/App/transactions/is_finalized/${id}`);
        setFinalize(finalized.data);
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

    const distributeMoneyEqually = async () => {
        await axios.put(
            `https://localhost:7076/api/App/members/equally/${id}`,
            parseInt(groupsInfo.oweMoney),
            {
                headers:
                {
                    "Content-Type": "application/json"
                }
            }
        );
        fetchSums();
        setDistributionIndex(-1);
        setNewMoney("");
        getData();
    };

    const distributeMoneyByPercentage = async (obj) => {
        if (distributionIndex !== 1) {
            setDistributionIndex(1);
        } else {
            const response = await axios.put(
                `https://localhost:7076/api/App/members/procent/${id}?name=${obj.name}&amount=${parseInt(groupsInfo.oweMoney)}&procent=${parseInt(newMoney)}`,
                obj,
                {
                    headers: { "Content-Type": "application/json" }
                }
            );

            setDistributionIndex(-1);
            setNewMoney("");
            getData();
        }
    };


    const distributeMoneyByDynamic = async (obj) => {
        if (distributionIndex !== 2) {
            setDistributionIndex(2);
        }
        else {
            const responce = await axios.put(
                `https://localhost:7076/api/App/members/dynamic/${id}?name=${obj.name}&newValue=${newMoney}`
            );

            setDistributionIndex(-1);
            setNewMoney("");
            getData();
        }
    };

    const finalizePayments = async () => {
        if(payAmount === getAmount && payAmount !== 0 && getAmount !== 0) {
            await axios.post(`https://localhost:7076/api/App/transactions/finalize/${id}`);
            setFinalize(true);
        }
    }

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

    useEffect(() => {
        fetchSums();
    }, [distributionIndex]);

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
                    <button className="btn btn-secondary" onClick={() => navigate('/')}>
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
                                onClick={() => changeGroupsMoney(newMoney)}>
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

                                    {(distributeMoney && distributionIndex >= 1 && !finalize) && (
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder={distributionIndex === 1 ? "Enter Percentage - [0-100]" : "Enter Money To Distribute - Whole Number"}
                                                onChange={(e) => setNewMoney(e.target.value)}
                                            />

                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-success"
                                                    onClick={() => distributionIndex === 1 ? distributeMoneyByPercentage(obj) : distributeMoneyByDynamic(obj)}
                                                >
                                                    Distribute By {distributionIndex === 1 ? "Percentage" : "Dynamic"} Money
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {!finalize &&
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => deletePlayer(obj)}>
                                            Delete Member
                                        </button>
                                    }

                                    {(finalize && obj.owedAmount === 0) && 
                                    <div>
                                        <div>Member Is Payed Off</div>
                                        <button className = 'btn btn-success' onClick = {() => deletePlayer(obj)}>
                                            Delete Member 
                                        </button>
                                    </div>
                                    }
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
                                <button className="btn btn-success" onClick={() => distributeMoneyByPercentage()}>Percentage</button>
                                <button className="btn btn-succses" onClick={() => distributeMoneyByDynamic()}>Dynamic</button>
                                <button className="btn btn-danger" onClick={() => setDistributeMoney(false)}>Cancel</button>
                            </div>
                        }

                        {finalize && 
                        <div>
                            <button className = 'btn btn-success' onClick = {() => navigate(`/transactions/${id}`)}>
                                Transactions Page</button>
                        </div>}

                        <div className="mt-4">
                            {!distributeMoney && !finalize ? (
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                            setAddName("");
                                            setAddMemberState(true);
                                        }}>
                                        Add Member
                                    </button>

                                    <button
                                        className="btn btn-success"
                                        onClick={() => setDistributeMoney(true)}
                                    >
                                        Distribute Money
                                    </button>

                                    <button className = "btn btn-warning" onClick={() => finalizePayments()}>
                                        Finalize The Payments 
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
                                            }}>
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
