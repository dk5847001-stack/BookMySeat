import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

class MailService {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    if (this.transporter) return this.transporter;

    if (!env.mail.host || !env.mail.user || !env.mail.pass) {
      this.transporter = nodemailer.createTransport({
        jsonTransport: true
      });
      return this.transporter;
    }

    this.transporter = nodemailer.createTransport({
      host: env.mail.host,
      port: env.mail.port,
      secure: env.mail.secure,
      auth: {
        user: env.mail.user,
        pass: env.mail.pass
      }
    });

    return this.transporter;
  }

  async sendMail({ to, subject, html, text, attachments = [] }) {
    const info = await this.getTransporter().sendMail({
      from: env.mail.from,
      to,
      subject,
      text,
      html,
      attachments
    });

    logger.info('Auth email dispatched', { to, subject, messageId: info.messageId });
    return info;
  }

  sendVerificationEmail(user, token) {
    const url = `${env.clientUrl}/verify-email/${token}`;
    return this.sendMail({
      to: user.email,
      subject: 'Verify your EventX Ultra account',
      text: `Verify your account: ${url}`,
      html: `<p>Welcome to EventX Ultra, ${user.name}.</p><p>Verify your account here: <a href="${url}">${url}</a></p>`
    });
  }

  sendPasswordResetEmail(user, token) {
    const url = `${env.clientUrl}/reset-password/${token}`;
    return this.sendMail({
      to: user.email,
      subject: 'Reset your EventX Ultra password',
      text: `Reset your password: ${url}`,
      html: `<p>Use this secure link to reset your password. It expires in 15 minutes.</p><p><a href="${url}">${url}</a></p>`
    });
  }

  sendBookingConfirmation({ user, booking, event }) {
    const attachments = booking.tickets.map((ticket) => ({
      filename: `${ticket.ticketCode}.png`,
      content: ticket.qrCode.replace(/^data:image\/png;base64,/, ''),
      encoding: 'base64',
      cid: ticket.ticketCode
    }));

    return this.sendMail({
      to: user.email,
      subject: `Booking confirmed: ${event.title}`,
      text: `Your booking ${booking.bookingId} is confirmed for ${event.title}. Seats: ${booking.seats.join(', ')}.`,
      html: `<p>Hi ${user.name},</p><p>Your booking <strong>${booking.bookingId}</strong> is confirmed for <strong>${event.title}</strong>.</p><p>Seats: ${booking.seats.join(', ')}</p><p>Your QR ticket images are attached.</p>`,
      attachments
    });
  }

  sendEventReminder({ user, booking, event }) {
    return this.sendMail({
      to: user.email,
      subject: `Reminder: ${event.title} is coming up`,
      text: `Reminder for ${event.title}. Booking ${booking.bookingId}, seats ${booking.seats.join(', ')}.`,
      html: `<p>Hi ${user.name},</p><p>This is a reminder for <strong>${event.title}</strong>.</p><p>Date: ${new Date(event.date).toLocaleString('en-IN')}</p><p>Seats: ${booking.seats.join(', ')}</p>`
    });
  }

  sendCancellationEmail({ user, booking, event }) {
    return this.sendMail({
      to: user.email,
      subject: `Booking cancelled: ${event.title}`,
      text: `Your booking ${booking.bookingId} for ${event.title} has been cancelled.`,
      html: `<p>Hi ${user.name},</p><p>Your booking <strong>${booking.bookingId}</strong> for <strong>${event.title}</strong> has been cancelled.</p><p>Refund processing has been initiated where applicable.</p>`
    });
  }
}

export const mailService = new MailService();
