import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import Payment from "../models/payment.model";
import Lesson from "../models/LessonModel";
import { NotificationController } from "./notification.controller";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-11-17.clover",
});

export class PaymentController {
  // Create Stripe Checkout Session
  static async createCheckoutSession(req: Request, res: Response) {
    try {
      const { tutorId, lessonId } = req.body;
      const userId = (req as any).user?.id || (req as any).user?._id;

      if (!userId || !tutorId || !lessonId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Missing required fields: userId, tutorId, or lessonId",
        });
      }

      // 🔹 Hardcode amount to 0 for testing
      const amount = 0;

      // Ensure CLIENT_URL has proper scheme - PRODUCTION FIX
      // Priority: CLIENT_URL -> FRONTEND_URL -> hardcoded production URL
      const clientUrl =
        process.env.CLIENT_URL ||
        process.env.FRONTEND_URL ||
        "https://meshspire-core.vercel.app";

      // Clean and validate URL
      let baseUrl = clientUrl.trim();
      // Replace wrong URL if it exists
      if (
        baseUrl.includes("meshspire-core.vercel.app") &&
        !baseUrl.includes("meshspire-core")
      ) {
        baseUrl = "https://meshspire-core.vercel.app";
        console.warn(
          "⚠️ Correcting CLIENT_URL from meshspire-core.vercel.app to meshspire-core.vercel.app"
        );
      }
      // Add https if missing
      if (!baseUrl.startsWith("http")) {
        baseUrl = `https://${baseUrl}`;
      }
      // Remove trailing slash
      baseUrl = baseUrl.replace(/\/$/, "");

      console.log("💳 Creating Stripe session with URLs:", {
        baseUrl,
        successUrl: `${baseUrl}/payment-success`,
        cancelUrl: `${baseUrl}/payment-failed`,
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { name: "Lesson Payment" },
              unit_amount: Math.round(amount * 100), // Stripe expects cents
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/payment-failed`,
      });

      // Save payment record as pending
      await Payment.create({
        userId,
        tutorId,
        lessonId,
        amount,
        currency: "usd",
        stripeSessionId: session.id,
        status: "pending",
      });

      return res.status(StatusCodes.OK).json({ url: session.url });
    } catch (err: any) {
      console.error("Stripe session error:", err);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Stripe session error", error: err.message });
    }
  }

  // Verify payment
  static async verifyPayment(req: Request, res: Response) {
    try {
      const { session_id } = req.query;

      if (!session_id) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "No session_id provided" });
      }

      const session = await stripe.checkout.sessions.retrieve(
        session_id as string
      );

      if (session.payment_status !== "paid") {
        const failedPayment = await Payment.findOneAndUpdate(
          { stripeSessionId: session_id },
          { status: "failed" },
          { new: true }
        );

        // Notify student about payment failure
        if (failedPayment && failedPayment._id) {
          await NotificationController.createNotification({
            userId: failedPayment.userId.toString(),
            type: "payment_failed",
            title: "Payment Failed",
            message: "Your payment was unsuccessful. Please try again.",
            paymentId: failedPayment._id.toString(),
            lessonId: failedPayment.lessonId.toString(),
          });
        }

        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Payment failed" });
      }

      // Update payment as completed
      const payment = await Payment.findOneAndUpdate(
        { stripeSessionId: session_id },
        {
          status: "completed",
          stripePaymentIntentId: session.payment_intent as string,
        },
        { new: true }
      );

      if (!payment) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: "Payment record not found" });
      }

      // Mark lesson as paid
      const lesson = await Lesson.findByIdAndUpdate(
        payment.lessonId,
        { isPaid: true },
        { new: true }
      );

      // Notify student about successful payment
      if (payment._id) {
        await NotificationController.createNotification({
          userId: payment.userId.toString(),
          type: "payment_success",
          title: "Payment Successful",
          message: `Payment successful for lesson "${
            lesson?.topic || "your lesson"
          }"`,
          paymentId: payment._id.toString(),
          lessonId: payment.lessonId.toString(),
        });
      }

      // Notify tutor about successful payment
      if (payment.tutorId && payment._id) {
        await NotificationController.createNotification({
          userId: payment.tutorId.toString(),
          type: "payment_success",
          title: "Payment Received",
          message: `Payment received for lesson "${
            lesson?.topic || "the lesson"
          }"`,
          paymentId: payment._id.toString(),
          lessonId: payment.lessonId.toString(),
        });
      }

      // Ensure conversation exists between student and tutor after payment
      if (payment.tutorId && payment.lessonId) {
        try {
          const { createConversation } = await import("./chat.controller");
          const conversation = await createConversation(
            payment.lessonId.toString(),
            payment.tutorId.toString()
          );
          console.log("✅ Conversation ensured after payment:", {
            conversationId: conversation?._id,
            lessonId: payment.lessonId,
          });

          // Send automatic "Hi" messages from both student and tutor
          if (conversation?._id) {
            try {
              const Message = (await import("../models/message.model")).default;

              // Student sends "Hi" message
              const studentMessage = new Message({
                conversationId: conversation._id,
                senderId: payment.userId,
                receiverId: payment.tutorId,
                content: "Hi! Looking forward to our lesson.",
                messageType: "text",
              });
              await studentMessage.save();
              console.log("✅ Auto-sent greeting from student");

              // Tutor sends "Hi" message
              const tutorMessage = new Message({
                conversationId: conversation._id,
                senderId: payment.tutorId,
                receiverId: payment.userId,
                content:
                  "Hi! I'm excited to help you learn. Feel free to ask any questions!",
                messageType: "text",
              });
              await tutorMessage.save();
              console.log("✅ Auto-sent greeting from tutor");

              // Update conversation with last message
              const Conversation = (
                await import("../models/conversation.model")
              ).default;
              await Conversation.findByIdAndUpdate(conversation._id, {
                lastMessage:
                  "Hi! I'm excited to help you learn. Feel free to ask any questions!",
                lastMessageAt: new Date(),
              });
            } catch (msgError) {
              console.error("⚠️ Error sending automatic greetings:", msgError);
            }
          }
        } catch (convError) {
          console.error(
            "⚠️ Error ensuring conversation after payment:",
            convError
          );
          // Don't fail payment if conversation creation fails
        }
      }

      return res.status(StatusCodes.OK).json({
        message: "Payment success",
        payment,
        lesson: {
          id: lesson?._id,
          topic: lesson?.topic,
          isPaid: lesson?.isPaid,
        },
      });
    } catch (err: any) {
      console.error("Payment verification error:", err);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Payment verification error", error: err.message });
    }
  }
}
