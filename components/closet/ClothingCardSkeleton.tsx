import { Card, CardBody, CardFooter, Skeleton } from "@heroui/react";

export function ClothingCardSkeleton() {
  return (
    <Card className="w-full bg-transparent">
      <CardBody className="p-0 aspect-[3/4] bg-content2">
        <Skeleton className="w-full h-full" />
      </CardBody>
      <CardFooter className="flex flex-col items-start p-4 gap-2">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-3 w-24 rounded" />
      </CardFooter>
    </Card>
  );
}
