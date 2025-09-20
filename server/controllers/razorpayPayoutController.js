const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const settings = require("../models/settings.js");
const Trainer = require("../models/trainer.js");

async function getRazorapyCred() {
  const rzSettings = await settings.findOne({});
  if (rzSettings) {
    return {
      username: rzSettings.razorpayKey,
      password: rzSettings.razorpaySecret,
    };
  } else {
    return null;
  }
}

async function processPayout(fund_account_id, amount, auth) {
  const payoutData = {
    account_number: "2323230028471272",
    fund_account_id: fund_account_id,
    amount: amount * 100,
    currency: "INR",
    mode: "IMPS",
    purpose: "salary",
    queue_if_low_balance: true,
    narration: "Lecture payout",
    notes: {
      note1: "Lecture Payout",
    },
    reference_id: uuidv4(),
  };

  const idempotencyKey = uuidv4();

  try {
    const response = await axios.post(
      "https://api.razorpay.com/v1/payouts",
      payoutData,
      {
        auth,
        headers: {
          "Content-Type": "application/json",
          "X-Payout-Idempotency": idempotencyKey,
        },
      }
    );

    const payoutId = response.data.id;
    const status = response.data.status;

    if (["failed", "rejected", "cancelled", "reversed"].includes(status)) {
      return { status: "failed", code: 400 };
    }

    return { status: "success", payoutId };
  } catch (err) {
    return { status: "failed", message: "Internal server error." };
  }
}

const makeRazorpayPayout = async (
  contact_name,
  contact_email,
  contact_mobile,
  trainer_account_number,
  trainer_ifsc,
  trainer_id,
  contact_id,
  fund_account_id,
  amount
) => {
  const auth = await getRazorapyCred();
  if (auth && (!auth.username || !auth.password)) {
    return {
      status: "failed",
      message: "Payout gateway is not configured pleases configure.",
    };
  }

  if (contact_id) {
    const fundResp = await axios.get(
      `https://api.razorpay.com/v1/fund_accounts/${fund_account_id}`,
      { auth }
    );

    const fund = fundResp.data;

    if (
      fund.bank_account.account_number === trainer_account_number &&
      fund.bank_account.ifsc === trainer_ifsc
    ) {
      return await processPayout(fund_account_id, amount, auth);
    } else {
      try {
        const newFundResp = await axios.post(
          "https://api.razorpay.com/v1/fund_accounts",
          {
            account_type: "bank_account",
            bank_account: {
              name: contact_name,
              ifsc: trainer_ifsc,
              account_number: trainer_account_number,
            },
            contact_id: contact_id,
          },
          { auth }
        );

        const newFund = newFundResp.data;

        await Trainer.findByIdAndUpdate(trainer_id, {
          fund_account_id: newFund.id,
        });

        return await processPayout(newFund.id, amount, auth);
      } catch (Err) {
        return {
          status: "failed",
          message:
            Err?.response?.data?.error.description ||
            "Some error while processing the payment.",
        };
      }
    }

  } else {
    const payoutData = {
      account_number: "2323230028471272",
      amount: amount * 100,
      currency: "INR",
      mode: "IMPS",
      purpose: "salary",
      fund_account: {
        account_type: "bank_account",
        bank_account: {
          name: contact_name,
          ifsc: trainer_ifsc,
          account_number: trainer_account_number,
        },
        contact: {
          name: contact_name,
          email: contact_email,
          contact: contact_mobile,
          type: "employee",
          reference_id: `${amount}`,
          notes: {
            trainer_name: contact_name,
          },
        },
      },
      queue_if_low_balance: true,
      reference_id: "",
      narration: "Lecture payout",
      notes: {
        note1: "Lecture Payout",
      },
    };

    const idempotencyKey = uuidv4();

    try {
      const response = await axios.post(
        "https://api.razorpay.com/v1/payouts",
        payoutData,
        {
          auth: auth,
          headers: {
            "Content-Type": "application/json",
            "X-Payout-Idempotency": idempotencyKey,
          },
        }
      );

      const { fund_account } = response.data;
      const new_fund_account_id = fund_account.id;
      const new_contact_id = fund_account.contact_id;
      const payoutId = response.data.id;

      if (
        ["failed", "rejected", "cancelled", "reversed"].includes(
          response.data.status
        )
      ) {
        return { status: "failed", message: "Please try again." };
      }

      await Trainer.findByIdAndUpdate(trainer_id, {
        contact_id: new_contact_id,
        fund_account_id: new_fund_account_id,
      });

      return { status: "success", payoutId: payoutId };
    } catch (Err) {

      console.log("Error in razorpayPayoutController:", Err);
      
      return {
        status: "failed",
        message:
          Err?.response?.data?.error.description ||
          "Some error while processing the payment.",
      };
    }
  }
};

module.exports = makeRazorpayPayout;