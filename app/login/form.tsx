"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";

export const LoginForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/forms";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const res = await signIn("credentials", {
        redirect: false,
        email: formValues.email,
        password: formValues.password,
        callbackUrl,
      });

      if (!res?.error) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError("Invalid email or password");
        setFormValues({ ...formValues }); // Keep the email
      }
    } catch (error: any) {
      setError(error?.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleOAuthSignIn = async (provider: string) => {
    try {
      setLoading(true);
      setError("");
      
      // Use the correct signIn method for OAuth providers
      await signIn(provider, { 
        callbackUrl,
        redirect: true // Important: redirect should be true for OAuth
      });
      
      // Note: No need to handle redirect manually as signIn will do it
    } catch (error: any) {
      setLoading(false);
      setError(`Error signing in with ${provider}: ${error?.message || "Unknown error"}`);
    }
  };

  const input_style =
    "form-control block w-full px-4 py-5 text-sm font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none";

  return (
    <form onSubmit={onSubmit}>
      {error && (
        <p className="text-center bg-red-300 py-4 mb-6 rounded">{error}</p>
      )}
      <div className="mb-6">
        <input
          required
          type="email"
          name="email"
          value={formValues.email}
          onChange={handleChange}
          placeholder="Email address"
          className={`${input_style}`}
        />
      </div>
      <div className="mb-6">
        <input
          required
          type="password"
          name="password"
          value={formValues.password}
          onChange={handleChange}
          placeholder="Password"
          className={`${input_style}`}
        />
      </div>
      <button
        type="submit"
        style={{ backgroundColor: `${loading ? "#ccc" : "#3446eb"}` }}
        className="inline-block px-7 py-4 bg-blue-600 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out w-full"
        disabled={loading}
      >
        {loading ? "loading..." : "Sign In"}
      </button>

      <div className="flex items-center my-4 before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5">
        <p className="text-center font-semibold mx-4 mb-0">OR</p>
      </div>

      <button
        type="button"
        className="px-7 py-2 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg transition duration-150 ease-in-out w-full flex justify-center items-center mb-3"
        style={{ backgroundColor: "#3b5998" }}
        onClick={() => handleOAuthSignIn("google")}
        disabled={loading}
      >
        <img
          className="pr-2"
          src="/images/google.svg"
          alt=""
          style={{ height: "2rem" }}
        />
        Continue with Google
      </button>
      
      <button
        type="button"
        className="px-7 py-2 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg transition duration-150 ease-in-out w-full flex justify-center items-center"
        style={{ backgroundColor: "#55acee" }}
        onClick={() => handleOAuthSignIn("github")}
        disabled={loading}
      >
        <img
          className="pr-2"
          src="/images/github.svg"
          alt=""
          style={{ height: "2.2rem" }}
        />
        Continue with GitHub
      </button>
    </form>
  );
};