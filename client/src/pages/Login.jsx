import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handeSubmit = async () => {
    setError(""); // Clear previous errors
    try {
      const res = await axios.post("http://localhost:3000/signin", {
        username: userName,
        password,
      });
      console.log(userName, password);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("userId", res.data.userId);
      navigate("/");
    } catch (err) {
      if (err.response) {
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
              onChange={(e) => setUserName(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="fieldgroup-password">Password</FieldLabel>
            <Input
              id="fieldgroup-password"
              type="password"
              autoComplete="new-password"
              value={password}
              placeholder=""
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          {error && (
            <p className="text-sm font-medium text-destructive text-center">
              {error}
            </p>
          )}

          <Field orientation="horizontal" className="flex gap-3 justify-end">
            <Button type="reset" variant="outline">
              Reset
            </Button>
            <Button onClick={handeSubmit}>Submit</Button>
          </Field>
        </FieldGroup>
      </div>
    </div>
  );
}
