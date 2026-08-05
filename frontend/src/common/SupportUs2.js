import React from "react";

const DonateSection = () => {
  const razorpayBase = "https://razorpay.me/@codingacademyindia";

  const donationOptions = [
    { label: "₹100", amount: 100 },
    { label: "₹200", amount: 200 },
    { label: "₹500", amount: 500 },
  ];

  const handleDonate = (amount) => {
    const url = amount
      ? `${razorpayBase}?amount=${amount}`
      : razorpayBase;
    window.open(url, "_blank");
  };

  return (
    <div
      style={{
        textAlign: "center",
        background: "#f9f9f9",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        maxWidth: "320px",
        margin: "0 auto",
      }}
    >
      <h3 style={{ marginBottom: "8px", color: "#333" }}>
        ❤️ Support Tennis India Live
      </h3>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>
        Help us keep tracking Indian tennis players around the world.
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
        {donationOptions.map((opt) => (
          <button
            key={opt.amount}
            onClick={() => handleDonate(opt.amount)}
            style={{
              background: "#0078d4",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {opt.label}
          </button>
        ))}
        <button
          onClick={() => handleDonate(null)}
          style={{
            background: "#e0e0e0",
            color: "#333",
            border: "none",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Custom
        </button>
      </div>
    </div>
  );
};

export default DonateSection;
