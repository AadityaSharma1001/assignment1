// src/app/api/portfolio/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";

export async function GET() {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const user = await User.findOne({ email: session.user.email });
  return new Response(JSON.stringify(user?.stocks || []));
}

export async function POST(req: NextRequest) {
  try {
    const { symbol } = await req.json();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;
    console.log("📦 POST Body:", { symbol, email });

    if (!symbol || !email) {
      return Response.json({ error: "Missing symbol or email" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { email },
      { $addToSet: { stocks: symbol } }, // avoid duplicates
      { new: true, upsert: true }        // create user if not exists
    );

    return Response.json({ message: "Stock added", user });
  } catch (error) {
    console.error("❌ Failed to add stock:", error);
    return Response.json({ error: "Failed to add stock" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 });

  const { symbol } = await req.json();
  console.log("📦 DELETE Body:", { symbol, email: session.user.email });
  if (!symbol) return new Response("Missing stock", { status: 400 });

  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    { $pull: { stocks: symbol } },
    { new: true }
  );
  return new Response(JSON.stringify(user.stocks));
}
