"use client";

import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { Button } from "@/src/lib/components/ui/button";
import { Input } from "@/src/lib/components/ui/input";
import { Textarea } from "@/src/lib/components/ui/textarea";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/src/lib/components/ui/field";
import { Checkbox } from "@/src/lib/components/ui/checkbox";
import Link from "next/link";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be at most 100 characters."),
  email: z.string().email("Please enter a valid email address."),
  company: z
    .string()
    .refine(
      (val) => val === "" || (val.length >= 2 && val.length <= 100),
      {
        message: "Company name must be between 2 and 100 characters if provided.",
      }
    ),
  phone: z
    .string()
    .refine(
      (val) => val === "" || /^[\d\s\-\+\(\)]+$/.test(val),
      {
        message: "Please enter a valid phone number.",
      }
    ),
  message: z
    .string()
    .min(1, "Message must be at least 1 character.")
    .max(1000, "Message must be at most 1000 characters."),
  sendConfirmationEmail: z.boolean(),
});

export default function HireMePage() {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      message: "",
      sendConfirmationEmail: false,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      // Here you would typically send the form data to your backend
      console.log("Form submitted:", value);
      alert("Thank you for your interest! I'll get back to you soon.");
      form.reset();
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="mb-8">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Let's Work Together
          </h1>
          <p className="text-muted-foreground">
            Fill out the form below and I'll get back to you as soon as possible.
          </p>
        </div>

        <div className="rounded-xl bg-white dark:bg-zinc-900 shadow-md border border-gray-100 dark:border-zinc-800 p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Name *</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Elon Musk"
                        autoComplete="name"
                      />
                      <FieldDescription>
                        Your full name
                      </FieldDescription>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="email"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email *</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="sama@openai.com"
                        autoComplete="email"
                      />
                      <FieldDescription>
                        Your email address
                      </FieldDescription>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="company"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Company</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Product, Anthropic."
                        autoComplete="organization"
                      />
                      <FieldDescription>
                        Your company or organization (optional)
                      </FieldDescription>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="phone"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="tel"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="+1 (555) 123-4567"
                        autoComplete="tel"
                      />
                      <FieldDescription>
                        Your phone number (optional)
                      </FieldDescription>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="message"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Message *</FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Share a link to job posting or tell me about your project, timeline, and what you're looking for..."
                        className="min-h-[120px]"
                      />
                      <FieldDescription>
                        Link to job posting or some other description of business opportunity.
                      </FieldDescription>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />

              <div className="pt-6 pb-4">
                <hr className="w-[60%] border-gray-100 dark:border-zinc-800" />
              </div>

              <form.Field
                name="sendConfirmationEmail"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field orientation="horizontal" data-invalid={isInvalid}>
                      <Checkbox
                        id={field.name}
                        name={field.name}
                        checked={field.state.value}
                        onCheckedChange={(checked) => {
                          field.handleChange(checked === true);
                        }}
                        aria-invalid={isInvalid}
                      />

                      <FieldLabel
                        htmlFor={field.name}
                        className="font-normal cursor-pointer"
                      >
                        Check if you'd like a confirmation email when your message is received.                        
                      </FieldLabel>
                    </Field>
                  );
                }}
              />
            </FieldGroup>



            <div className="flex gap-4 mt-6">
              <Button type="submit">Send Message</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Reset
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

