import { PrismaClient, Role, RepairStatus, NotificationChannel } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const branch = await prisma.branch.upsert({
    where: { code: "MAIN" },
    update: {},
    create: {
      name: "Main Service Center",
      code: "MAIN",
      address: "Ring Road, Kathmandu",
      phone: "+977-9800000000"
    }
  });

  const categoryNames = [
    "Television",
    "Refrigerator",
    "Washing Machine",
    "Fan",
    "Air Conditioner",
    "Water Cooler",
    "Water Pump",
    "Microwave",
    "Inverter",
    "Stabilizer",
    "Computer",
    "Mobile Phone",
    "Other"
  ];

  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.repairCategory.upsert({
        where: { name },
        update: {},
        create: { name }
      })
    )
  );

  const admin = await prisma.user.upsert({
    where: { email: "admin@repairpro.local" },
    update: {},
    create: {
      name: "Aarav Sharma",
      email: "admin@repairpro.local",
      passwordHash,
      role: Role.SUPER_ADMIN,
      branchId: branch.id
    }
  });

  await prisma.user.upsert({
    where: { email: "reception@repairpro.local" },
    update: {},
    create: {
      name: "Maya Reception",
      email: "reception@repairpro.local",
      passwordHash,
      role: Role.RECEPTION,
      branchId: branch.id
    }
  });

  const technicianUser = await prisma.user.upsert({
    where: { email: "tech@repairpro.local" },
    update: {},
    create: {
      name: "Suman Technician",
      email: "tech@repairpro.local",
      passwordHash,
      role: Role.TECHNICIAN,
      branchId: branch.id
    }
  });

  const tv = categories.find((category) => category.name === "Television") ?? categories[0];
  const mobile = categories.find((category) => category.name === "Mobile Phone") ?? categories[0];

  const technician = await prisma.technician.upsert({
    where: { userId: technicianUser.id },
    update: {},
    create: {
      name: "Suman Technician",
      mobileNumber: "+977-9811111111",
      address: "Lalitpur",
      skillCategoryId: tv.id,
      experience: "7 years",
      userId: technicianUser.id,
      branchId: branch.id
    }
  });

  const customerUser = await prisma.user.upsert({
    where: { email: "customer@repairpro.local" },
    update: {},
    create: {
      name: "Nisha Customer",
      email: "customer@repairpro.local",
      passwordHash,
      role: Role.CUSTOMER,
      branchId: branch.id
    }
  });

  const customer = await prisma.customer.upsert({
    where: { customerCode: "CUS-0001" },
    update: {},
    create: {
      customerCode: "CUS-0001",
      fullName: "Nisha Rai",
      mobileNumber: "+977-9822222222",
      alternateNumber: "+977-9844444444",
      address: "Baneshwor, Kathmandu",
      email: "customer@repairpro.local",
      customerType: "RESIDENTIAL",
      notes: "Prefers WhatsApp updates.",
      userId: customerUser.id,
      branchId: branch.id
    }
  });

  await prisma.sparePart.upsert({
    where: { sku: "LED-BL-32" },
    update: {},
    create: {
      partName: "32 inch LED Backlight Strip",
      sku: "LED-BL-32",
      quantity: 12,
      lowStockLevel: 4,
      purchaseCost: 800,
      sellingPrice: 1400,
      supplier: "Electro Parts Nepal",
      branchId: branch.id
    }
  });

  await prisma.sparePart.upsert({
    where: { sku: "MOB-CHG-PORT-C" },
    update: {},
    create: {
      partName: "USB-C Charging Port",
      sku: "MOB-CHG-PORT-C",
      quantity: 3,
      lowStockLevel: 5,
      purchaseCost: 180,
      sellingPrice: 450,
      supplier: "Mobile Hub",
      branchId: branch.id
    }
  });

  const job = await prisma.repairJob.upsert({
    where: { ticketNumber: "RPR-20260603-0001" },
    update: {},
    create: {
      ticketNumber: "RPR-20260603-0001",
      customerId: customer.id,
      categoryId: tv.id,
      branchId: branch.id,
      brand: "Samsung",
      modelNumber: "UA32T",
      serialNumber: "SN-TV-87923",
      productColor: "Black",
      productCondition: "Screen has no visible crack; unit powers on intermittently.",
      accessoriesReceived: "Remote, power cable",
      problemDescription: "No display after startup, sound works occasionally.",
      expectedDeliveryDate: new Date("2026-06-07T10:00:00.000Z"),
      status: RepairStatus.IN_REPAIR,
      warrantyPeriodDays: 90,
      createdById: admin.id
    }
  });

  await prisma.jobAssignment.upsert({
    where: { repairJobId_technicianId: { repairJobId: job.id, technicianId: technician.id } },
    update: {},
    create: {
      repairJobId: job.id,
      technicianId: technician.id,
      isLead: true
    }
  });

  await prisma.repairStatusEvent.createMany({
    data: [
      { repairJobId: job.id, status: RepairStatus.RECEIVED, createdBy: admin.id, notes: "Product received at front desk." },
      { repairJobId: job.id, status: RepairStatus.UNDER_INSPECTION, createdBy: technicianUser.id, notes: "Initial inspection started." },
      { repairJobId: job.id, status: RepairStatus.IN_REPAIR, createdBy: technicianUser.id, notes: "Backlight replacement in progress." }
    ],
    skipDuplicates: true
  });

  await prisma.repairJob.upsert({
    where: { ticketNumber: "RPR-20260603-0002" },
    update: {},
    create: {
      ticketNumber: "RPR-20260603-0002",
      customerId: customer.id,
      categoryId: mobile.id,
      branchId: branch.id,
      brand: "OnePlus",
      modelNumber: "Nord",
      serialNumber: "SN-MOB-52201",
      productColor: "Blue",
      productCondition: "Charging socket loose, frame has minor scratches.",
      accessoriesReceived: "None",
      problemDescription: "Phone does not charge unless cable is held at an angle.",
      expectedDeliveryDate: new Date("2026-06-05T10:00:00.000Z"),
      status: RepairStatus.INSPECTION_PENDING,
      createdById: admin.id
    }
  });

  const templates = [
    ["JOB_RECEIVED", "Repair ticket {{ticketNumber}} has been received."],
    ["TECHNICIAN_ASSIGNED", "A technician has been assigned to {{ticketNumber}}."],
    ["REPAIR_STARTED", "Repair work has started for {{ticketNumber}}."],
    ["WAITING_FOR_APPROVAL", "Approval is needed for {{ticketNumber}}."],
    ["READY_FOR_DELIVERY", "{{ticketNumber}} is ready for delivery."],
    ["DELIVERED", "{{ticketNumber}} has been delivered. Thank you."]
  ] as const;

  for (const [eventKey, body] of templates) {
    await prisma.notificationTemplate.upsert({
      where: { eventKey_channel: { eventKey, channel: NotificationChannel.WHATSAPP } },
      update: {},
      create: {
        eventKey,
        channel: NotificationChannel.WHATSAPP,
        subject: eventKey.replaceAll("_", " "),
        body
      }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
