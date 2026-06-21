import type { ReviewType } from "@/modules/reviews/domain/types";

const BUGS_SAMPLE = `type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  discount?: number;
};

type Order = {
  id: string;
  items: CartItem[];
  customerId: string;
  couponCode?: string;
};

function calculateTotal(order: Order): number {
  let total = 0;

  // Bug: off-by-one — should be i < order.items.length
  for (let i = 0; i <= order.items.length; i++) {
    const item = order.items[i];
    // Bug: item is undefined on the last iteration, crashes here
    total += item.price * item.quantity;
  }

  if (order.couponCode) {
    // Bug: applies discount for any truthy value, no coupon validation
    total *= 0.9;
  }

  return total;
}

function applyDiscounts(items: CartItem[]): CartItem[] {
  // Bug: mutates original objects instead of returning new ones
  for (const item of items) {
    if (item.discount) {
      item.price -= item.discount;
    }
  }
  return items;
}

function getPrimaryItem(order: Order): CartItem {
  // Bug: non-null assertion silences the error; find() can return undefined
  return order.items.find((i) => i.quantity > 1)!;
}

function formatSummary(order: Order): string {
  const total = calculateTotal(order);
  const primary = getPrimaryItem(order);
  // Bug: primary.name crashes at runtime if getPrimaryItem returns undefined
  return "Order " + order.id + " | Lead: " + primary.name + " | Total: $" + total.toFixed(2);
}`;

const SECURITY_SAMPLE = `import { db } from "./db";

type RequestContext = {
  body: Record<string, unknown>;
  headers: Record<string, string>;
};

async function deleteAccount(ctx: RequestContext): Promise<object> {
  const { userId, role } = ctx.body as { userId: string; role: string };

  // Security: trusting role from the client body, not from a verified session
  if (role !== "admin") {
    return { ok: false, error: "Forbidden" };
  }

  try {
    const user = await db.findUserById(userId);

    if (!user) {
      // Security: leaking internal query detail in the error response
      return {
        ok: false,
        error: "No user found with id " + userId + " in table 'accounts'",
      };
    }

    await db.deleteUser(userId);
    // Security: returning the full user record including sensitive fields
    return { ok: true, deleted: user };
  } catch (err) {
    // Security: leaking the full stack trace to the API caller
    return { ok: false, stack: (err as Error).stack };
  }
}

async function getProfile(ctx: RequestContext): Promise<object> {
  const token = ctx.headers["x-session-token"];

  // Security: length check only — no signature or expiry verification
  if (!token || token.length < 10) {
    return { ok: false, error: "Unauthorized" };
  }

  const { targetUserId } = ctx.body as { targetUserId: string };

  // Security: no authorization check — any valid token can read any user's data
  const profile = await db.findUserById(targetUserId);
  return { ok: true, profile };
}

async function updateRole(ctx: RequestContext): Promise<object> {
  // Security: no authentication at all
  const { userId, newRole } = ctx.body as { userId: string; newRole: string };
  // Security: newRole is not validated against an allowlist of permitted values
  await db.updateUser(userId, { role: newRole });
  return { ok: true };
}`;

const ARCHITECTURE_SAMPLE = `import { prisma } from "./db";
import { sendEmail } from "./email";
import { stripe } from "./payments";

// Architecture: one function handling validation, payment, persistence, and notification
export async function subscribeUser(input: unknown): Promise<object> {
  // Architecture: inline validation instead of a dedicated schema/validator
  if (typeof input !== "object" || input === null) {
    throw new Error("Invalid input");
  }
  const data = input as Record<string, string>;
  if (!data.email || !data.email.includes("@")) throw new Error("Invalid email");
  if (!data.plan || !["basic", "pro"].includes(data.plan)) throw new Error("Invalid plan");

  // Architecture: hardcoded business rule mixed directly into the function body
  const amount = data.plan === "pro" ? 2999 : 999;

  // Architecture: payment provider tightly coupled — impossible to unit-test without Stripe
  const charge = await stripe.charges.create({
    amount,
    currency: "usd",
    source: data.cardToken,
  });

  if (charge.status !== "succeeded") {
    throw new Error("Payment failed");
  }

  // Architecture: direct Prisma call — data access mixed with business logic
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    await prisma.user.update({ where: { email: data.email }, data: { plan: data.plan } });
  } else {
    await prisma.user.create({ data: { email: data.email, plan: data.plan } });
  }

  // Architecture: duplicated plan-price logic (already computed above as amount)
  const displayPrice = data.plan === "pro" ? "$29.99" : "$9.99";

  // Architecture: notification logic embedded directly in the subscription handler
  await sendEmail({
    to: data.email,
    subject: "Subscription confirmed",
    body: "Your " + data.plan + " plan (" + displayPrice + ") is now active. Ref: " + charge.id,
  });

  return {
    success: true,
    plan: data.plan,
    price: displayPrice,
    chargeId: charge.id,
  };
}`;

export const CODE_SAMPLES: Partial<Record<ReviewType, string>> = {
  bugs: BUGS_SAMPLE,
  security: SECURITY_SAMPLE,
  architecture: ARCHITECTURE_SAMPLE,
};
