import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dJUDt42s1IZRfN",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "hKpXt9j507BTNNfsE3xaF0by",
});

export default razorpayInstance;
