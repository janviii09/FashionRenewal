import { Module } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceController } from './marketplace.controller';
import { OrderStateMachineService } from './order-state-machine.service';
import { OrderPaymentTransactionService } from './order-payment-transaction.service';

@Module({
    controllers: [MarketplaceController],
    providers: [MarketplaceService, OrderStateMachineService, OrderPaymentTransactionService],
    exports: [MarketplaceService, OrderPaymentTransactionService],
})
export class MarketplaceModule { }
