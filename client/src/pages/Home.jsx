import { Button } from "@/components/ui/button";

export default function Home() {
  const name = localStorage.getItem("username");
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {!name && (
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Expense Management
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Signup or signin to manage your expenses efficiently and
            effortlessly.
          </p>
        </div>
      )}
      {name && (
        <div>
          <Button className="m-4">Add Expense</Button>
          <Button>Add Income</Button>
        </div>
      )}
    </div>
  );
}
