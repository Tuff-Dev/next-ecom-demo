import { wixClientServer } from "@/lib/wixClientServer";
import { members } from "@wix/members";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Check if we have a refresh token
    const cookieStore = cookies();
    const refreshToken = cookieStore.get("refreshToken");

    if (!refreshToken?.value) {
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

// Add dynamic config to prevent static generation of this route
export const dynamic = "force-dynamic";
