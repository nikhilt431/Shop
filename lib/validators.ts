import { z } from "zod";

export const customerSchema = z.object({
  fullName: z.string().min(2),
  mobileNumber: z.string().min(7),
  alternateNumber: z.string().optional(),
  address: z.string().min(3),
  email: z.string().email().optional().or(z.literal("")),
  customerType: z.enum(["WALK_IN", "RESIDENTIAL", "BUSINESS", "WARRANTY"]).default("WALK_IN"),
  notes: z.string().optional()
});

export const repairJobSchema = z.object({
  customerId: z.string().min(1),
  categoryId: z.string().min(1),
  brand: z.string().min(1),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  productColor: z.string().optional(),
  productCondition: z.string().min(3),
  accessoriesReceived: z.string().optional(),
  problemDescription: z.string().min(5),
  expectedDeliveryDate: z.string().optional(),
  technicianIds: z.array(z.string()).optional(),
  warrantyPeriodDays: z.coerce.number().int().positive().optional()
});

export const technicianSchema = z.object({
  name: z.string().min(2),
  mobileNumber: z.string().min(7),
  address: z.string().min(3),
  skillCategoryId: z.string().optional(),
  experience: z.string().min(1),
  status: z.enum(["ACTIVE", "ON_LEAVE", "INACTIVE"]).default("ACTIVE")
});

export const inventorySchema = z.object({
  partName: z.string().min(2),
  sku: z.string().min(2),
  quantity: z.coerce.number().int().min(0),
  lowStockLevel: z.coerce.number().int().min(0),
  purchaseCost: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),
  supplier: z.string().optional()
});

export const invoiceSchema = z.object({
  repairJobId: z.string().min(1),
  laborCharges: z.coerce.number().min(0),
  tax: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
  paymentMethod: z.enum(["CASH", "CARD", "BANK_TRANSFER", "MOBILE_PAYMENT"]).optional(),
  paymentStatus: z.enum(["DRAFT", "UNPAID", "PARTIALLY_PAID", "PAID", "VOID"]).default("UNPAID")
});

export const statusUpdateSchema = z.object({
  status: z.enum([
    "RECEIVED",
    "INSPECTION_PENDING",
    "UNDER_INSPECTION",
    "WAITING_FOR_PARTS",
    "IN_REPAIR",
    "TESTING",
    "COMPLETED",
    "READY_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED"
  ]),
  notes: z.string().optional()
});

export const noteSchema = z.object({
  type: z.enum(["INSPECTION", "REPAIR", "TESTING", "CUSTOMER_COMMUNICATION", "INTERNAL"]),
  note: z.string().min(2)
});
