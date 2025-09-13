import CreationCard from "@/components/creation-card";
import Nav from "@/components/nav";

export default async function Page() {
  return (
    <>
      <Nav mode="creation" />
      <main className="w-screen h-[90vh] py-24">
        <CreationCard />
      </main>
    </>
  );
}
