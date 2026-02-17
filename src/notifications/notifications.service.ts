import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import {
  Notification,
  NotificationType,
  NotificationChannel,
} from './entities/notification.entity';
import { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private mailerService: MailerService,
  ) {}

  // Create a notification
  async create(
    userId: number,
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      user_id: userId,
    });

    return this.notificationRepository.save(notification);
  }

  // Get all notifications for a user
  async findAllByUser(
    userId: number,
    unreadOnly: boolean = false,
  ): Promise<Notification[]> {
    const where: any = { user_id: userId };

    if (unreadOnly) {
      where.is_read = false;
    }

    return this.notificationRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  // Mark notification as read
  async markAsRead(
    notificationId: number,
    userId: number,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user_id: userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.is_read = true;
    notification.read_at = new Date();

    return this.notificationRepository.save(notification);
  }

  // Mark all notifications as read
  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true, read_at: new Date() },
    );
  }

  // Send transaction notification
  async sendTransactionNotification(
    userId: number,
    userEmail: string,
    userName: string,
    transactionType: string,
    amount: number,
    accountNumber: string,
  ): Promise<void> {
    // Create in-app notification
    await this.create(userId, {
      type: NotificationType.TRANSACTION,
      channel: NotificationChannel.IN_APP,
      title: `${transactionType} Transaction`,
      message: `Your ${transactionType.toLowerCase()} of $${amount} has been completed successfully.`,
      metadata: { amount, accountNumber, transactionType },
    });

    // Send email notification
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: `Transaction Alert - ${transactionType}`,
        template: 'transaction',
        context: {
          name: userName,
          transactionType,
          amount,
          accountNumber,
          date: new Date().toLocaleDateString(),
        },
      });

      await this.create(userId, {
        type: NotificationType.TRANSACTION,
        channel: NotificationChannel.EMAIL,
        title: `${transactionType} Transaction Email`,
        message: `Email sent successfully`,
        metadata: { email: userEmail },
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  // Send loan notification
  async sendLoanNotification(
    userId: number,
    userEmail: string,
    userName: string,
    loanStatus: string,
    loanAmount: number,
    loanType: string,
  ): Promise<void> {
    // Create in-app notification
    await this.create(userId, {
      type: NotificationType.LOAN,
      channel: NotificationChannel.IN_APP,
      title: `Loan ${loanStatus}`,
      message: `Your ${loanType} loan application for $${loanAmount} has been ${loanStatus.toLowerCase()}.`,
      metadata: { loanAmount, loanType, loanStatus },
    });

    // Send email notification
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: `Loan Application ${loanStatus}`,
        template: 'loan',
        context: {
          name: userName,
          loanStatus,
          loanAmount,
          loanType,
          date: new Date().toLocaleDateString(),
        },
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  // Send account notification
  async sendAccountNotification(
    userId: number,
    userEmail: string,
    userName: string,
    accountAction: string,
    accountNumber: string,
  ): Promise<void> {
    // Create in-app notification
    await this.create(userId, {
      type: NotificationType.ACCOUNT,
      channel: NotificationChannel.IN_APP,
      title: `Account ${accountAction}`,
      message: `Your account ${accountNumber} has been ${accountAction.toLowerCase()}.`,
      metadata: { accountNumber, accountAction },
    });

    // Send email notification
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: `Account Alert - ${accountAction}`,
        template: 'account',
        context: {
          name: userName,
          accountAction,
          accountNumber,
          date: new Date().toLocaleDateString(),
        },
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  // Send security notification
  async sendSecurityNotification(
    userId: number,
    userEmail: string,
    userName: string,
    securityEvent: string,
  ): Promise<void> {
    // Create in-app notification
    await this.create(userId, {
      type: NotificationType.SECURITY,
      channel: NotificationChannel.IN_APP,
      title: 'Security Alert',
      message: securityEvent,
      metadata: { event: securityEvent },
    });

    // Send email notification
    try {
      await this.mailerService.sendMail({
        to: userEmail,
        subject: 'Security Alert - Banking System',
        template: 'security',
        context: {
          name: userName,
          event: securityEvent,
          date: new Date().toLocaleDateString(),
        },
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  // Get unread count
  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { user_id: userId, is_read: false },
    });
  }

  // Delete notification
  async delete(notificationId: number, userId: number): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user_id: userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await this.notificationRepository.remove(notification);
  }
}
