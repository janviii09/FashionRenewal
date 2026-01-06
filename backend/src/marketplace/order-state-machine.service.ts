import { Injectable, BadRequestException } from "@nestjs/common";
import { OrderStatus } from "@prisma/client";

@Injectable()
export class OrderStateMachineService {
  // Define valid state transitions
  private readonly transitions: Map<OrderStatus, OrderStatus[]> = new Map([
    [OrderStatus.REQUESTED, [OrderStatus.APPROVED, OrderStatus.CANCELLED]],
    [OrderStatus.APPROVED, [OrderStatus.PAID, OrderStatus.CANCELLED]],
    [OrderStatus.PAID, [OrderStatus.DISPATCHED, OrderStatus.CANCELLED]],
    [OrderStatus.DISPATCHED, [OrderStatus.DELIVERED, OrderStatus.CANCELLED]],
    [
      OrderStatus.DELIVERED,
      [OrderStatus.RETURN_REQUESTED, OrderStatus.COMPLETED],
    ],
    [OrderStatus.RETURN_REQUESTED, [OrderStatus.RETURNED]],
    [OrderStatus.RETURNED, [OrderStatus.COMPLETED]],
    [OrderStatus.COMPLETED, []],
    [OrderStatus.CANCELLED, []],
  ]);

  /**
   * Check if a state transition is valid
   */
  canTransition(from: OrderStatus, to: OrderStatus): boolean {
    const allowedTransitions = this.transitions.get(from);
    if (!allowedTransitions) {
      return false;
    }
    return allowedTransitions.includes(to);
  }

  /**
   * Validate and enforce state transition
   * Throws BadRequestException if transition is invalid
   */
  validateTransition(from: OrderStatus, to: OrderStatus): void {
    if (!this.canTransition(from, to)) {
      throw new BadRequestException(
        `Invalid state transition: ${from} → ${to}. Allowed transitions from ${from}: ${this.transitions.get(from)?.join(", ") || "none"}`,
      );
    }
  }

  /**
   * Get all valid next states for a given current state
   */
  getValidNextStates(currentState: OrderStatus): OrderStatus[] {
    return this.transitions.get(currentState) || [];
  }
}
