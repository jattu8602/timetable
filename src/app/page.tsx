import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Samayak</CardTitle>
          <CardDescription>Welcome to your admin dashboard</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            API is ready at <code className="rounded bg-muted px-1 py-0.5">/api/users</code>
          </p>
          <div className="flex gap-2">
            <Button>Get Started</Button>
            <Button variant="outline">Documentation</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
