import { wixClientServer } from "@/lib/wixClientServer";
import { members } from "@wix/members";
import { NextRequest, NextResponse } from "next/server";

// Prevent static generation
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // During build time, return empty response
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return NextResponse.json({
      user: null,
      orders: [],
    });
  }

  try {
    // Get the authorization cookie from the request headers
    const authCookie = request.cookies.get("refreshToken");

    if (!authCookie?.value) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const wixClient = await wixClientServer();

    const user = await wixClient.members.getCurrentMember({
      fieldsets: [members.Set.FULL],
    });

    if (!user.member?.contactId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch orders for the user
    const orderRes = await wixClient.orders.searchOrders({
      search: {
        filter: { "buyerInfo.contactId": { $eq: user.member.contactId } },
      },
    });

    return NextResponse.json({
      user: user.member,
      orders: orderRes.orders || [],
    });
  } catch (error) {
    console.error("Profile API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile data" },
      { status: 401 }
    );
  }
}
