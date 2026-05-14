import { AdminPositionsPanel } from "@/components/admin-positions-panel";
import { getPositionDatasetConfig, type PositionDatasetId } from "@/lib/admin-position-datasets";

export const metadata = {
  title: "Админка позиций",
};

type AdminPageProps = {
  searchParams: Promise<{
    dataset?: string;
  }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { dataset } = await searchParams;
  const initialDatasetId = getPositionDatasetConfig(dataset ?? "")?.id as PositionDatasetId | undefined;

  if (!process.env.ADMIN_PASS) {
    return (
      <main className="min-h-screen bg-stone-100 px-4 py-10 text-stone-900">
        <section className="mx-auto max-w-xl rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-950">Доступ запрещен</h1>
          <p className="mt-4 text-base leading-7 text-stone-700">
            Не установлен пароль на сервере - доступ запрещен.
          </p>
        </section>
      </main>
    );
  }

  return <AdminPositionsPanel initialDatasetId={initialDatasetId} />;
}
