import Link from "next/link";
import { useRouter } from "next/router";
import { auth } from "../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

import Image from "next/image";
import mccLogo from "@/../public/mcc.svg"

export default function LoginLanding() {
  const router = useRouter();
  useEffect(() => {
    if (router?.query?.signout === "true") {
      auth.signOut();
      router.push("/");
    } else {
      onAuthStateChanged(auth, (user) => {
        if (user) router.push("/dashboard");
      });
    }
  }, []);

  return (
    <div>
      <div className="min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full">
          <div>
            <Image
              className="mx-auto h-12 w-auto"
              src={mccLogo}
              alt="MCC Logo"
            />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Registration Site
            </h2>

            <h3 className="mt-6 text-center text-xl font-bold tracking-tight text-gray-900">
              I am a...
            </h3>
          </div>
        </div>

        <div className="mt-6 mx-auto md:max-w-4xl text-center grid md:grid-flow-col justify-stretch text-3xl font-bold">
          <Link
            href="/login"
            className="block p-2 bg-blue-100 hover:bg-blue-200 rounded-lg drop-shadow-md m-2 md:py-16 mx-4"
          >
            Teacher
          </Link>
          <Link
            href="/student/login"
            className="block p-2 bg-blue-100 hover:bg-blue-200 rounded-lg drop-shadow-md m-2 md:py-16 mx-4"
          >
            Student
          </Link>
          <Link
            href="/login"
            className="block p-2 bg-blue-100 hover:bg-blue-200 rounded-lg drop-shadow-md m-2 md:py-16 mx-4"
          >
            Parent
          </Link>
        </div>
        <div className="text-center mt-4 text-red-500">
          {router?.query?.error == "not-logged-in" &&
            "You must be logged in to view that page."}
        </div>
      </div>
    </div>
  );
}
