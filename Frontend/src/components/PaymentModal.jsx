import { useState } from "react";
import { motion } from "framer-motion";
import { HiX, HiCheck, HiCash, HiCreditCard, HiShieldCheck } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { getBookingTotal, to12Hour } from "../utils/helpers";
import api from "../api/axios";
import toast from "react-hot-toast";

const UPI_APPS = [
  { id: "gpay", name: "Google Pay", icon: "https://img.icons8.com/color/96/google-pay.png" },
  { id: "paytm", name: "Paytm", icon: "https://img.icons8.com/color/96/paytm.png" },
  { id: "phonepe", name: "PhonePe", icon: "https://img.icons8.com/color/96/phone-pe.png" },
  { id: "bhim", name: "BHIM UPI", icon: "https://img.icons8.com/color/96/bhim-upi.png" },
];

export default function PaymentModal({ bookingData, ground, onSuccess, onClose }) {
  const { user, addToVault, deductFromVault } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedUpiApp, setSelectedUpiApp] = useState(null);
  const [processing, setProcessing] = useState(false);

  const { subtotal, platformFee, gst, finalAmount } = getBookingTotal(ground, {
    date: bookingData.date,
    startTime: bookingData.startTime,
    duration: bookingData.duration,
  });
  const vaultBalance = user?.vaultBalance || 0;
  const round2 = (n) => Math.round(n * 100) / 100;
  const vaultShortfall = round2(vaultBalance) < round2(finalAmount) ? round2(finalAmount - vaultBalance) : 0;

  async function handlePay() {
    if (!selectedMethod) {
      toast.error("Select a payment method");
      return;
    }
    if (selectedMethod === "upi" && !selectedUpiApp) {
      toast.error("Select a UPI app");
      return;
    }
    if (selectedMethod === "vault" && vaultShortfall > 0.005) {
      toast.error("Insufficient vault balance");
      return;
    }

    setProcessing(true);
    await new Promise((r) => setTimeout(r, 600));

    try {
      if (selectedMethod === "upi") {
        addToVault(finalAmount);
        deductFromVault(round2(finalAmount));
      } else if (selectedMethod === "vault") {
        deductFromVault(round2(finalAmount));
      }

      const res = await api.post("/bookings", {
        userId: user?._id,
        groundId: bookingData.groundId,
        name: bookingData.name,
        phone: bookingData.phone,
        email: bookingData.email,
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        duration: parseInt(bookingData.duration),
        paymentMethod: selectedMethod === "upi" ? `upi_${selectedUpiApp}` : selectedMethod,
        platformFee,
        gstAmount: gst,
        gstWaived: true,
        paidFromVault: selectedMethod === "upi" || selectedMethod === "vault" ? finalAmount : 0,
        finalAmount,
      });
      toast.success("Payment successful! Booking confirmed.");
      onSuccess(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-card payment-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}><HiX /></button>
        <h3>Complete Payment</h3>

        <div className="payment-summary">
          <div className="payment-summary-row">
            <span>{ground?.name}</span>
            <span>{bookingData.date} · {to12Hour(bookingData.startTime)} – {to12Hour(bookingData.endTime)}</span>
          </div>
        </div>

        <div className="price-breakdown">
          <div className="price-row">
            <span>Subtotal ({parseInt(bookingData.duration)} hr{parseInt(bookingData.duration) > 1 ? "s" : ""})</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="price-row">
            <span>Platform Fee</span>
            <span>₹{platformFee.toFixed(2)}</span>
          </div>
          <div className="price-row gst-row">
            <span>GST ({Number(localStorage.getItem("nm_gst_rate")) || 18}%)</span>
            <span className="gst-added">+₹{gst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="price-row discount-row">
            <span>Discount</span>
            <span className="gst-waived">−₹{gst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="price-divider" />
          <div className="price-row price-total">
            <span>Total Amount</span>
            <span>₹{finalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="payment-methods">
          <h4>Pay with</h4>
          <div className="payment-method-options">
            <button
              className={`payment-method-btn${selectedMethod === "upi" ? " active" : ""}`}
              onClick={() => { setSelectedMethod("upi"); setSelectedUpiApp(null); }}
            >
              <HiCreditCard />
              <span>UPI</span>
            </button>
            <button
              className={`payment-method-btn${selectedMethod === "vault" ? " active" : ""}`}
              onClick={() => setSelectedMethod("vault")}
            >
              <HiCash />
              <span>Vault{user ? ` (₹${vaultBalance.toLocaleString("en-IN")})` : ""}</span>
            </button>
          </div>

          {selectedMethod === "upi" && (
            <div className="upi-apps">
              {UPI_APPS.map((app) => (
                <button
                  key={app.id}
                  className={`upi-app-btn${selectedUpiApp === app.id ? " active" : ""}`}
                  onClick={() => setSelectedUpiApp(app.id)}
                >
                  <img src={app.icon} alt={app.name} />
                  <span>{app.name}</span>
                  {selectedUpiApp === app.id && <HiCheck className="upi-check" />}
                </button>
              ))}
            </div>
          )}

          {selectedMethod === "vault" && vaultShortfall <= 0.005 && (
            <p className="vault-note vault-note-success">
              Pay ₹{finalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} from your Vault Balance
            </p>
          )}

          {selectedMethod === "vault" && vaultShortfall > 0.005 && (
            <p className="vault-note vault-note-insufficient">
              Insufficient vault balance — short by ₹{vaultShortfall.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>

        <button
          className="btn-primary pay-now-btn"
          onClick={handlePay}
          disabled={processing || !selectedMethod || (selectedMethod === "upi" && !selectedUpiApp) || (selectedMethod === "vault" && vaultShortfall > 0.005)}
        >
          {processing
            ? "Processing..."
            : selectedMethod === "vault" && vaultShortfall <= 0.005
              ? `Pay ₹${finalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} from Vault`
              : selectedMethod === "vault" && vaultShortfall > 0.005
                ? "Insufficient Vault Balance"
                : `Pay ₹${finalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
        </button>

        <div className="payment-secure-note">
          <HiShieldCheck /> Secure payment • Your data is protected
        </div>
      </motion.div>
    </motion.div>
  );
}
