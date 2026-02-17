import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
} from 'class-validator';
import {
  NotificationType,
  NotificationChannel,
} from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsObject()
  @IsOptional()
  metadata?: any;
}

export class SendEmailDto {
  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  template: string;

  @IsObject()
  @IsOptional()
  context?: any;
}
