import { ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="p-6">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link href="/activity">
          <ArrowLeft className="mr-1 h-3 w-3" /> Back to Activity
        </Link>
      </Button>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-10 w-10 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-medium">Action not found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This action may have expired or been deleted.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
