import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Stepper, Step, StepLabel } from '@mui/material';
import axios from "axios";

function NewTransaction() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [payers, setPayers] = useState([]);
    const [payees, setPayees] = useState([]);
    const [payersName, setPayersName] = useState('');
    const [payeesName, setPayeesName] = useState('');
    const [amount, setAmount] = useState(0);
    const [step, setStep] = useState(0);

    const steps = ['Enter Payer', 'Enter Payee', 'Enter Amount', 'Make Transaction'];
    const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];

    useEffect(() => {
        const fetchData = async () => {
            const transactions = await axios.get(`https://localhost:7076/api/App/transactions/${id}`);
            setTransactions(transactions.data);

            const payers = await axios.get(`https://localhost:7076/api/App/members/payers/${id}`);
            setPayers(payers.data);

            const payees = await axios.get(`https://localhost:7076/api/App/members/payees/${id}`);
            setPayees(payees.data);
        };
        fetchData();
    }, [step, id]);

    const nextStep = () => {
        if (step === 0 && payersName !== '-') setStep(step + 1);
        else if (step === 1 && payeesName !== '-') setStep(step + 1);
        else if (step === 2 && amount > 0) setStep(step + 1);
    };

    const sumbitTransaction = async () => {
        const response = await axios.post(
            `https://localhost:7076/api/App/transactions/sumbit/${id}`,
            null,
            {
                params: {
                    payersName: payersName,
                    payeesName: payeesName,
                    amount: amount
                }
            }
        );

        setPayersName('');
        setPayeesName('');
        setAmount(0);
        setStep(0);
    };

    return (
        <div className="container mt-4">
            <button className="btn btn-secondary mb-3" onClick={() => navigate(`/group-info/${id}`)}>Back</button>
            <h4 className="mb-3">Transactions</h4>

            <div className="list-group mb-4">
                {transactions.map((t, i) => (
                    <div
                        key={i}
                        className={`list-group-item list-group-item-${colors[i % colors.length]}`}>
                        {t.payersName} paid {t.payeeName} {t.totalAmount}
                    </div>
                ))}
            </div>

            <Stepper activeStep={step} className="mb-4">
                {steps.map(label => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {step === 0 && (
                <div className="mb-3">
                    <label className="form-label">Select Payer</label>
                    <select className="form-select" onChange={(e) => setPayersName(e.target.value)}>
                        <option value="-">-</option>
                        {payers.map(p => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {step === 1 && (
                <div className="mb-3">
                    <label className="form-label">Select Payee</label>
                    <select className="form-select" onChange={(e) => setPayeesName(e.target.value)}>
                        <option value="-">-</option>
                        {payees.map(p => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {step === 2 && (
                <div className="mb-3">
                    <label className="form-label">Enter Amount</label>
                    <input
                        type="number"
                        className="form-control"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value))}
                        min={0}
                    />
                </div>
            )}

            {step <= 2 ? (
                <button className="btn btn-primary" onClick={nextStep}>Next</button>
            ) : (
                <div className="mt-3">
                    <div className="mb-2">
                        <strong>Confirm:</strong> {payersName} pays {payeesName} {amount}
                    </div>
                    <button className="btn btn-success" onClick={sumbitTransaction}>Submit Transaction</button>
                </div>
            )}
        </div>
    );
}

export default NewTransaction;
