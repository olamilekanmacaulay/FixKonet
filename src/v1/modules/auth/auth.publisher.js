const { getChannel } = require("../../services/rabbitmq/connection.rabbitmq");

class AuthPublisher {
    async publishOTPRequest(payload) {
        try {
            const channel = getChannel();
            const exchange = "auth_exchange";

            await channel.assertExchange(exchange, "direct", { durable: true });
            channel.publish(exchange, "otp_request", Buffer.from(JSON.stringify(payload)), {
                persistent: true,
            });

            console.log("Published OTP request to RabbitMQ:", payload);
        } catch (error) {
            console.error("Failed to publish OTP request:", error);
            throw error;
        }
    }
}

module.exports = new AuthPublisher();
