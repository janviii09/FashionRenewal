import { Prisma } from "@prisma/client";

/**
 * Generates a Prisma where clause to exclude items that:
 * 1. Belong to the current user (Owner Exclusion)
 * 2. Have been previously purchased/rented/swapped by the user (Interaction Exclusion) - Based on Completed/Active Orders
 *
 * @param userId - The ID of the current user. If null/undefined, returns empty exclusion (no filter).
 * @returns Prisma.WardrobeItemWhereInput
 */
export function getMarketplaceExclusionFilter(
  userId?: number,
): Prisma.WardrobeItemWhereInput {
  if (!userId) {
    return {};
  }

  return {
    // Rule 1: Exclude items owned by the user
    ownerId: {
      not: userId,
    },
    // Rule 2: Exclude items the user has previously successfully ordered (Purchase, Rent, Swap)
    orders: {
      none: {
        renterId: userId,
        // We exclude items where the user has an order that is NOT cancelled
        // This covers: REQUESTED, APPROVED, PAID, DELIVERED, COMPLETED, etc.
        // If the user tried to buy it but cancelled, they might want to try again
        // The prompt says "existing relationship: rented, purchased, swapped"
        // Usually "Cancelled" implies no relationship established
        status: {
          notIn: ["CANCELLED"],
        },
      },
    },
  };
}
