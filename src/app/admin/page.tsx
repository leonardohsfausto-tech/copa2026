import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";

export const metadata = {
  title: "Admin - Copa 2026",
};

export default async function AdminPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  const primaryEmail = user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId
  )?.emailAddress;

  if (primaryEmail !== "leonardohs.fausto@gmail.com") {
    redirect("/");
  }

  // Obter o cliente do Clerk
  const client = await clerkClient();

  // Buscar todos os usuários para pegar a contagem. 
  // O Clerk tem getCount, podemos usar isso para o total, 
  // e getUserList para pegar os mais recentes e contar os do dia.
  let totalUsers = 0;
  let newUsersToday = 0;
  let serializedUsers: any[] = [];

  try {
    const countResponse = await client.users.getCount();
    totalUsers = countResponse;

    const usersList = await client.users.getUserList({
      limit: 100,
      orderBy: "-created_at",
    });
    
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    newUsersToday = usersList.data.filter(
      (u) => new Date(u.createdAt) >= startOfToday
    ).length;

    serializedUsers = usersList.data.map((u) => {
      const email = u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)?.emailAddress || u.emailAddresses[0]?.emailAddress || "Sem e-mail";
      const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.username || "Usuário sem nome";
      return {
        id: u.id,
        name,
        email,
        imageUrl: u.imageUrl,
        createdAt: u.createdAt,
        lastSignInAt: u.lastSignInAt || null,
      };
    });

  } catch (error) {
    console.error("Erro ao buscar usuários do Clerk:", error);
  }

  return (
    <div className="space-y-4 md:space-y-8 pb-20 px-4 md:px-8 max-w-[1800px] mx-auto pt-6 md:pt-8 bg-background">
      <AdminDashboard 
        totalClerkUsers={totalUsers} 
        newUsersToday={newUsersToday} 
        users={serializedUsers}
      />
    </div>
  );
}
