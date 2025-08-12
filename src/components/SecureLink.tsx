"use client";

import Link from "next/link";
import { markNavigation } from "@/utils/pageSession";
import { MouseEvent, ReactNode } from "react";

interface SecureLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  title?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

const SecureLink: React.FC<SecureLinkProps> = ({
  href,
  children,
  className,
  title,
  onClick,
}) => {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Mark as navigation to prevent authentication prompt
    markNavigation();

    // Call any additional onClick handler
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link href={href} className={className} title={title} onClick={handleClick}>
      {children}
    </Link>
  );
};

export default SecureLink;
