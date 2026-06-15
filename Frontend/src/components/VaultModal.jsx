import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiX, HiPlus, HiCash, HiCheck, HiCreditCard } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const PRESETS = [100, 200, 500, 1000, 2000];

const UPI_APPS = [
  { id: "gpay", name: "Google Pay", icon: "https://img.icons8.com/color/96/google-pay.png" },
  { id: "paytm", name: "Paytm", icon: "https://img.icons8.com/color/96/paytm.png" },
  { id: "phonepe", name: "PhonePe", icon: "https://img.icons8.com/color/96/phone-pe.png" },
  { id: "bhim", name: "BHIM UPI", icon: "https://img.icons8.com/color/96/bhim-upi.png" },
];

export default function VaultModal({ onClose }) {
  const { user, addToVault } = useAuth();
  const [step, setStep] = useState("amount");
  const [amount, setAmount] = useState("");
  const [selectedUpiApp, setSelectedUpiApp] = useState(null);
  const [processing, setProcessing] = useState(false);

  function handleProceedToPayment() {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setStep("payment");
  }

  async function handlePay() {
    if (!selectedUpiApp) {
      toast.error("Select a UPI app");
      return;
    }
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1000));
    const val = parseFloat(amount);
    addToVault(val);
    setProcessing(false);
    setStep("success");
  }

  const val = parseFloat(amount) || 0;

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-card vault-modal"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}><HiX /></button>

        <AnimatePresence mode="wait">
          {step === "amount" && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="vault-header">
                <div className="vault-icon"><HiCash /></div>
                <h3>My Vault</h3>
                <p>Add money for quick and easy bookings</p>
              </div>

              <div className="vault-balance-card">
                <span className="vault-balance-label">Current Balance</span>
                <span className="vault-balance-value">₹{(user?.vaultBalance || 0).toLocaleString("en-IN")}</span>
              </div>

              <div className="vault-presets">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`vault-preset-btn${val === p ? " active" : ""}`}
                    onClick={() => setAmount(String(p))}
                  >
                    ₹{p}
                  </button>
                ))}
              </div>

              <div className="vault-input-row">
                <span className="vault-currency">₹</span>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                />
              </div>

              <button
                className="btn-primary vault-add-btn"
                onClick={handleProceedToPayment}
                disabled={!amount || val <= 0}
              >
                Add Money Via UPI <HiCreditCard />
              </button>
            </motion.div>
          )}

          {step === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="vault-header">
                <div className="vault-icon"><HiCreditCard /></div>
                <h3>Pay ₹{val.toLocaleString("en-IN")}</h3>
                <p>Select your UPI app to add money</p>
              </div>

              <div className="vault-upi-apps">
                {UPI_APPS.map((app) => (
                  <button
                    key={app.id}
                    className={`vault-upi-btn${selectedUpiApp === app.id ? " active" : ""}`}
                    onClick={() => setSelectedUpiApp(app.id)}
                  >
                    <img src={app.icon} alt={app.name} />
                    <span>{app.name}</span>
                    {selectedUpiApp === app.id && <HiCheck className="vault-upi-check" />}
                  </button>
                ))}
              </div>

              <div className="vault-pay-amount">
                <span>Amount to pay</span>
                <strong>₹{val.toLocaleString("en-IN")}</strong>
              </div>

              <button
                className="btn-primary vault-add-btn"
                onClick={handlePay}
                disabled={processing || !selectedUpiApp}
              >
                {processing ? "Processing..." : `Pay ₹${val.toLocaleString("en-IN")}`}
              </button>

              <button
                className="vault-back-btn"
                onClick={() => setStep("amount")}
              >
                Back to amount
              </button>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
            >
              <div className="vault-success-icon">
                <HiCheck />
              </div>
              <div className="vault-header">
                <h3>Money Added!</h3>
                <p>₹{val.toLocaleString("en-IN")} has been added to your vault</p>
              </div>

              <div className="vault-balance-card">
                <span className="vault-balance-label">New Balance</span>
                <span className="vault-balance-value">₹{(user?.vaultBalance || 0).toLocaleString("en-IN")}</span>
              </div>

              <button className="btn-primary vault-add-btn" onClick={onClose}>
                Done <HiCheck />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
