import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useState } from "react";
import { z } from "zod";

// Zod validation schema for login
const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleReset = () => {
    setUserName("");
    setPassword("");
    setError("");
    setFieldErrors({});
  };

  const handeSubmit = async () => {
    setError("");
    setFieldErrors({});

    // Validate with Zod
    const result = loginSchema.safeParse({
      username: userName,
      password: password,
    });

    if (!result.success) {
      const errors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0];
        if (!errors[field]) {
          errors[field] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/signin", {
        username: userName,
        password,
      });
      // Updated to match server response structure
      const { token, userName: name, userId } = res.data.data;
      localStorage.setItem("token", token);
      localStorage.setItem("username", name);
      localStorage.setItem("userId", userId);
      window.location.href = "/";
    } catch (err) {
      if (err.response) {
        // Handle validation errors from backend
        if (err.response.data && err.response.data.errors) {
          const backendErrors = {};
          err.response.data.errors.forEach((error) => {
            if (error.field) {
              backendErrors[error.field] = error.message;
            }
          });
          if (Object.keys(backendErrors).length > 0) {
            setFieldErrors(backendErrors);
          }
        }

        if (err.response.status === 404) {
          setError("User not found.");
        } else if (err.response.status === 401) {
          setError("Invalid password.");
        } else {
          setError(err.response.data.message || "An error occurred.");
        }
      } else {
        setError("Network error. Please try again later.");
      }
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-center text-2xl font-bold">SignIn Page</h1>

        <FieldGroup className="space-y-4">
          <Field>
            <FieldLabel htmlFor="fieldgroup-name">Name</FieldLabel>
            <Input
              id="fieldgroup-name"
              placeholder="Vineet Paun"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                if (fieldErrors.username) {
                  setFieldErrors((prev) => ({ ...prev, username: undefined }));
                }
              }}
              className={fieldErrors.username ? "border-red-500 border-2" : ""}
            />
            {fieldErrors.username && (
              <p
                className="text-sm font-medium mt-1 text-destructive"
                style={{ color: "rgb(239, 68, 68)" }}
              >
                ⚠️ {fieldErrors.username}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="fieldgroup-password">Password</FieldLabel>
            <Input
              id="fieldgroup-password"
              type="password"
              autoComplete="new-password"
              value={password}
              placeholder=""
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              className={fieldErrors.password ? "border-red-500 border-2" : ""}
            />
            {fieldErrors.password && (
              <p
                className="text-sm font-medium mt-1 text-destructive"
                style={{ color: "rgb(239, 68, 68)" }}
              >
                ⚠️ {fieldErrors.password}
              </p>
            )}
          </Field>

          {error && (
            <p
              className="text-sm font-medium text-center text-destructive"
              style={{ color: "rgb(239, 68, 68)" }}
            >
              ⚠️ {error}
            </p>
          )}

          <Field orientation="horizontal" className="flex gap-3 justify-end">
            <Button type="reset" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handeSubmit}>Submit</Button>
          </Field>
        </FieldGroup>
      </div>
    </div>
  );
}
