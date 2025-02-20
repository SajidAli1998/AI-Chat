"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface HeaderButtonProps {
  text: string;
  href: string;
}

export function HeaderButton({ text, href }: HeaderButtonProps) {
  const router = useRouter();

  const handleButtonClick = () => {
    router.push(href);
  };

  return (
    <Button onClick={handleButtonClick} variant="outline">
      {text}
    </Button>
  );
}
