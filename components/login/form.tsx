"use client";
import React from "react";
import { Form, Input, Button } from "@heroui/react";
import { SignInButtonGithub } from "./button";

export const LoginForm = () => {
  return (
    <div className="p-5 flex flex-col items-center">
      <Form className="w-1/2 flex flex-col gap-4 ">
        <Input
          isRequired
          errorMessage="Please enter a valid username"
          label="Username"
          labelPlacement="outside"
          name="username"
          placeholder="Enter your username"
          type="text"
        />

        <Input
          isRequired
          errorMessage="Please enter a valid email"
          label="Email"
          labelPlacement="outside"
          name="email"
          placeholder="Enter your email"
          type="email"
        />
        <div className="flex w-full gap-2">
          <Button color="primary" type="submit" className="w-1/2">
            Submit
          </Button>
          <Button type="reset" variant="flat" className="w-1/2">
            Reset
          </Button>
        </div>
        <SignInButtonGithub />
      </Form>
    </div>
  );
};
