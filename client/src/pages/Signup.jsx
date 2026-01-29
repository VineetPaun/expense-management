import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

// Zod validation schema for signup
const signupSchema = z.object({
  username: z
    .string()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// Helper to check password requirements
const getPasswordRequirements = (password) => ({
  minLength: password.length >= 6,
  hasUppercase: /[A-Z]/.test(password),
  hasNumber: /[0-9]/.test(password),
});

export default function Signup() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleReset = () => {
    setUserName("");
    setPassword("");
    setError("");
    setFieldErrors({});
  };

  const handeSubmit = async () => {
    setError(""); // Clear previous errors
    setFieldErrors({});

    // Validate with Zod
    const result = signupSchema.safeParse({
      username: userName,
      password: password,
    });

    if (!result.success) {
      // Extract field-specific errors
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
      await axios.post("http://localhost:3000/signup", {
        username: userName,
        password,
      });
      console.log(userName, password);
      navigate("/");
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError("User already exists. Please try a different name.");
      } else {
        setError("An error occurred. Please try again later.");
      }
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-center text-2xl font-bold">Signup Page</h1>

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
            {/* Password requirements checklist */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1 text-sm">
                <p
                  className={`flex items-center gap-1 ${
                    getPasswordRequirements(password).minLength
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {getPasswordRequirements(password).minLength ? "✓" : "○"} At
                  least 6 characters
                </p>
                <p
                  className={`flex items-center gap-1 ${
                    getPasswordRequirements(password).hasUppercase
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {getPasswordRequirements(password).hasUppercase ? "✓" : "○"}{" "}
                  Contains an uppercase letter
                </p>
                <p
                  className={`flex items-center gap-1 ${
                    getPasswordRequirements(password).hasNumber
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {getPasswordRequirements(password).hasNumber ? "✓" : "○"}{" "}
                  Contains a number
                </p>
              </div>
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
