import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WardrobeItem, Prisma } from '@prisma/client';

@Injectable()
export class WardrobeService {
    constructor(private prisma: PrismaService) { }

    async createItem(data: Prisma.WardrobeItemCreateInput): Promise<WardrobeItem> {
        return this.prisma.wardrobeItem.create({ data });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.WardrobeItemWhereUniqueInput;
        where?: Prisma.WardrobeItemWhereInput;
        orderBy?: Prisma.WardrobeItemOrderByWithRelationInput;
    }): Promise<WardrobeItem[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return this.prisma.wardrobeItem.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
        });
    }

    async findOne(id: number): Promise<WardrobeItem | null> {
        return this.prisma.wardrobeItem.findUnique({ where: { id } });
    }

    async updateItem(params: {
        where: Prisma.WardrobeItemWhereUniqueInput;
        data: Prisma.WardrobeItemUpdateInput;
    }): Promise<WardrobeItem> {
        const { where, data } = params;
        return this.prisma.wardrobeItem.update({
            data,
            where,
        });
    }

    async deleteItem(where: Prisma.WardrobeItemWhereUniqueInput): Promise<WardrobeItem> {
        return this.prisma.wardrobeItem.delete({
            where,
        });
    }
}
