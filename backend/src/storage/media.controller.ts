import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StorageService } from './storage.service';

@Controller('media')
@UseGuards(AuthGuard('jwt'))
export class MediaController {
  constructor(private readonly storage: StorageService) {}

  @Get()
  list(
    @Query('folder') folder?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.storage.listFiles({
      folder,
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Delete(':publicId(*)')
  async remove(@Param('publicId') publicId: string) {
    const decoded = decodeURIComponent(publicId);
    const ok = await this.storage.deleteFile(decoded);
    return { success: ok, publicId: decoded };
  }
}
