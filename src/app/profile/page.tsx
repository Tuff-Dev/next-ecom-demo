"use client";

import { useEffect, useState } from "react";
import { useWixClient } from "@/hooks/useWixClient";
import { useRouter } from "next/navigation";
import UpdateButton from "@/components/UpdateButton";
import { updateUser } from "@/lib/actions";
import { members } from "@wix/members";
import { orders } from "@wix/ecom";
import Link from "next/link";
import { format } from "timeago.js";

type Order = orders.Order;

export default function ProfilePage() {
  const wixClient = useWixClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<members.Member | null>(null);
  const [orderData, setOrderData] = useState<Order[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isLoggedIn = wixClient.auth.loggedIn();
        if (!isLoggedIn) {
          router.push("/login");
          return;
        }

        // Fetch profile data from API
        const response = await fetch("/api/profile");
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();
        setUserData(data.user);
        setOrderData(data.orders);
      } catch (error) {
        console.error("Profile Error:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [wixClient, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!userData) {
    return <div className="">Not logged in!</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-24 md:h-[calc(100vh-180px)] items-center px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
      <div className="w-full md:w-1/2">
        <h1 className="text-2xl">Profile</h1>
        <form action={updateUser} className="mt-12 flex flex-col gap-4">
          <input
            type="text"
            hidden
            name="id"
            value={userData.contactId || ""}
          />
          <label className="text-sm text-gray-700">Username</label>
          <input
            type="text"
            name="username"
            placeholder={userData.profile?.nickname || "john"}
            className="ring-1 ring-gray-300 rounded-md p-2 max-w-96"
          />
          <label className="text-sm text-gray-700">First Name</label>
          <input
            type="text"
            name="firstName"
            placeholder={userData.contact?.firstName || "John"}
            className="ring-1 ring-gray-300 rounded-md p-2 max-w-96"
          />
          <label className="text-sm text-gray-700">Surname</label>
          <input
            type="text"
            name="lastName"
            placeholder={userData.contact?.lastName || "Doe"}
            className="ring-1 ring-gray-300 rounded-md p-2 max-w-96"
          />
          <label className="text-sm text-gray-700">Phone</label>
          <input
            type="text"
            name="phone"
            placeholder={
              (userData.contact?.phones && userData.contact?.phones[0]) ||
              "+1234567"
            }
            className="ring-1 ring-gray-300 rounded-md p-2 max-w-96"
          />
          <label className="text-sm text-gray-700">E-mail</label>
          <input
            type="email"
            name="email"
            placeholder={userData.loginEmail || "john@gmail.com"}
            className="ring-1 ring-gray-300 rounded-md p-2 max-w-96"
          />
          <UpdateButton />
        </form>
      </div>
      <div className="w-full md:w-1/2">
        <h1 className="text-2xl">Orders</h1>
        <div className="mt-12 flex flex-col">
          {orderData.map((order) => (
            <Link
              href={`/orders/${order._id}`}
              key={order._id}
              className="flex justify-between px-2 py-6 rounded-md hover:bg-green-50 even:bg-slate-100"
            >
              <span className="w-1/4">{order._id?.substring(0, 10)}...</span>
              <span className="w-1/4">
                £{order.priceSummary?.subtotal?.amount}
              </span>
              {order._createdDate && (
                <span className="w-1/4">{format(order._createdDate)}</span>
              )}
              <span className="w-1/4">{order.status}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
