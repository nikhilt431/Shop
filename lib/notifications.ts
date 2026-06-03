import { NotificationChannel } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function queueRepairNotification(input: {
  eventKey: string;
  repairJobId: string;
  channel?: NotificationChannel;
}) {
  const channel = input.channel ?? "WHATSAPP";
  const job = await prisma.repairJob.findUniqueOrThrow({
    where: { id: input.repairJobId },
    include: { customer: true }
  });
  const template = await prisma.notificationTemplate.findUnique({
    where: { eventKey_channel: { eventKey: input.eventKey, channel } }
  });

  const message = (template?.body ?? "{{ticketNumber}} status updated.")
    .replaceAll("{{ticketNumber}}", job.ticketNumber)
    .replaceAll("{{customerName}}", job.customer.fullName);

  return prisma.notification.create({
    data: {
      customerId: job.customerId,
      repairJobId: job.id,
      channel,
      destination: channel === "EMAIL" ? job.customer.email ?? job.customer.mobileNumber : job.customer.mobileNumber,
      subject: template?.subject,
      message
    }
  });
}
