import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { CampService } from './camp.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('camps')
export class CampController {
  constructor(private readonly campService: CampService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.campService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.campService.findOne(Number(id));
  }

  @Post()
  async create(@Body() body: any) {
    return this.campService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.campService.update(Number(id), body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.campService.remove(Number(id));
  }
}

@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomController {
  constructor(private readonly campService: CampService) {}

  @Get()
  async findAllRooms(@Query() query: any) {
    return this.campService.findAllRooms(query);
  }

  @Get('with-beds-students')
  async findAllRoomsWithDetails(@Query() query: any) {
    return this.campService.findAllRoomsWithDetails(query);
  }

  @Get(':id')
  async findOneRoom(@Param('id') id: string) {
    return this.campService.findOneRoom(Number(id));
  }

  @Post()
  async createRoom(@Body() body: any) {
    return this.campService.createRoom(body);
  }

  @Put(':id')
  async updateRoom(@Param('id') id: string, @Body() body: any) {
    return this.campService.updateRoom(Number(id), body);
  }

  @Delete(':id')
  async removeRoom(@Param('id') id: string) {
    return this.campService.removeRoom(Number(id));
  }

  @Post('apply-checkin')
  async applyCheckin(@Body() body: any) {
    return this.campService.applyCheckin(body);
  }

  @Post('apply-change-bed')
  async applyChangeBed(@Body() body: any) {
    return this.campService.applyChangeBed(body);
  }

  @Post('checkout-student')
  async checkoutStudent(@Body() body: any) {
    return this.campService.checkoutStudent(body);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('room-types')
export class RoomTypeController {
  constructor(private readonly campService: CampService) {}

  @Get()
  async findAllRoomTypes() {
    return this.campService.findAllRoomTypes();
  }

  @Get(':id')
  async findOneRoomType(@Param('id') id: string) {
    return this.campService.findOneRoomType(Number(id));
  }

  @Post()
  async createRoomType(@Body() body: any) {
    return this.campService.createRoomType(body);
  }

  @Put(':id')
  async updateRoomType(@Param('id') id: string, @Body() body: any) {
    return this.campService.updateRoomType(Number(id), body);
  }

  @Delete(':id')
  async removeRoomType(@Param('id') id: string) {
    return this.campService.removeRoomType(Number(id));
  }
}

@UseGuards(JwtAuthGuard)
@Controller('beds')
export class BedController {
  constructor(private readonly campService: CampService) {}

  @Get()
  async findAllBeds(@Query() query: any) {
    return this.campService.findAllBeds(query);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('facilities')
export class FacilityController {
  constructor(private readonly campService: CampService) {}

  @Get()
  async findAll(@Query() query: any, @Req() req: any) {
    return this.campService.findAllFacilities(query, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.campService.findOneFacility(Number(id), req.user);
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    return this.campService.createFacility(body, req.user);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.campService.updateFacility(Number(id), body, req.user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.campService.removeFacility(Number(id), req.user);
  }
}
