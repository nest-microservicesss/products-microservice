import { Injectable, Logger, NotFoundException, OnModuleInit, Query } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService')
  onModuleInit() {
    this.$connect
    this.logger.log('Database connected')
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalPages = await this.product.count({
      where: {
        availabale: true
      }
    });
    const lastPage = Math.ceil(totalPages / limit);
    return {

      data: await this.product.findMany(
        {
          where: {
            availabale: true
          },
          skip: (page - 1) * 10,
          take: limit,
        }
      ),
      meta: {
        page: page,
        totalPages: lastPage
      }
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst(
      {
        where: {
          id,
          availabale: true
        }
      }
    );
    if (!product) {
      throw new NotFoundException(`El producto con el id ${id} no ha sido encontrado.`)
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;
    await this.findOne(id);
    return this.product.update(
      {
        where: { id },
        data: data
      }
    );
  }

  async remove(id: number) {
    await this.findOne(id);
    const product = await this.product.update({
      where: {
        id: id
      },
      data: {
        availabale: false
      }
    })
    return product;
  }
}
