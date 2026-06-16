"use client";

import { useEffect, useRef, useState } from "react";
import NextLink from "next/link";

import { handleSignOut } from "@/modules/auth/actions/sign-out";
import { Link } from "@/i18n/navigation";

interface UserDropdownAuthenticatedProps {
  isAuthenticated: true;
  displayName: string;
  greetingText: string;
  myReviewsLabel: string;
  signOutLabel: string;
}

interface UserDropdownAnonymousProps {
  isAuthenticated: false;
  signInLabel: string;
}

type Props = UserDropdownAuthenticatedProps | UserDropdownAnonymousProps;

export function UserDropdown(props: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!props.isAuthenticated) {
    return (
      <NextLink
        href="/api/auth/signin"
        className="text-sm text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        {props.signInLabel}
      </NextLink>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {props.greetingText}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="size-3 shrink-0"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-1 min-w-40 rounded-md border border-zinc-200 bg-white py-1 shadow-md dark:border-zinc-700 dark:bg-zinc-800"
        >
          <Link
            href="/dashboard"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {props.myReviewsLabel}
          </Link>
          <div className="my-1 border-t border-zinc-100 dark:border-zinc-700" />
          <form action={handleSignOut}>
            <button
              type="submit"
              role="menuitem"
              className="block w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {props.signOutLabel}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
