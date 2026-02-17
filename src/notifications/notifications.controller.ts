import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @GetUser('userId') userId: number,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationsService.findAllByUser(
      userId,
      unreadOnly === 'true',
    );
  }

  @Get('unread-count')
  getUnreadCount(@GetUser('userId') userId: number) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Post(':id/read')
  markAsRead(@Param('id') id: string, @GetUser('userId') userId: number) {
    return this.notificationsService.markAsRead(+id, userId);
  }

  @Post('read-all')
  markAllAsRead(@GetUser('userId') userId: number) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @GetUser('userId') userId: number) {
    return this.notificationsService.delete(+id, userId);
  }
}
