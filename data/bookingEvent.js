module.exports = [
  {
    bookingEvent: [
      {
        event: "64d5f8a5b4c9e3a8f7c3b2a1", // Event _id from your events collection
        userId: "64d5f8a5b4c9e3a8f7c3b2a2", // User _id from users collection
        participants: 2,
        status: "confirmed",
        payment: {
          amount: 24000,
          method: "upi",
          transactionId: "TXN7648239",
          status: "success",
        },
        specialRequests: "Vegetarian meals required",
      },
      {
        event: "64d5f8a5b4c9e3a8f7c3b2a1", // Same event, different user
        userId: "64d5f8a5b4c9e3a8f7c3b2a3",
        participants: 4,
        status: "pending",
        payment: {
          amount: 48000,
          method: "credit_card",
          status: "pending",
        },
      },
      {
        event: "64d5f8a5b4c9e3a8f7c3b2a4", // Different event
        userId: "64d5f8a5b4c9e3a8f7c3b2a2",
        participants: 1,
        status: "completed",
        payment: {
          amount: 15000,
          method: "net_banking",
          transactionId: "TXN9827364",
          status: "success",
        },
        specialRequests: "Need wheelchair access",
      },
    ],
  },
];
