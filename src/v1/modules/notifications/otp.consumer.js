const { getChannel } = require("../../../services/rabbitmq/connection.rabbitmq");
const smsService = require("../../../utils/send_sms");

async function consumeOTPRequests() {
    try {
        const channel = getChannel();
        const queue = "otp_request_queue";
        const exchange = "auth_exchange";
            
        await channel.assertExchange(exchange, "direct", { durable: true });
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, "otp_request");

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const payload = JSON.parse(msg.content.toString());
                console.log("Received OTP request:", payload);

                const { phoneNumber, otp } = payload;

                // Send OTP via SMS
                try {
                    await smsService.sendOTP(phoneNumber, otp);
                    console.log(`OTP sent to ${phoneNumber}`);
                    channel.ack(msg);
                } catch (smsError) {
                    console.error(`Failed to send OTP to ${phoneNumber}:`, smsError);
                    // Optionally, you can implement a retry mechanism or move the message to a dead-letter queue
                    channel.nack(msg, false, false); // Discard the message
                }
            }
         }, { noAck: false });

        console.log("OTP Consumer is running and waiting for messages...");
    } catch (error) {
        console.error("Failed to consume OTP requests:", error);
        throw error;
    }
}
     

module.exports = consumeOTPRequests()   ;