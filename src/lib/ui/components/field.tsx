import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/lib/utils";
import * as React from "react";

const fieldVariants = cva("", {
  variants: {
    orientation: {
      vertical: "flex flex-col gap-2",
      horizontal: "flex flex-row items-center gap-4",
      responsive: "flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

const Field = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof fieldVariants> & {
      "data-invalid"?: boolean;
    }
>(({ className, orientation, "data-invalid": dataInvalid, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-invalid={dataInvalid}
      className={cn(
        fieldVariants({ orientation }),
        dataInvalid && "text-destructive",
        className
      )}
      {...props}
    />
  );
});
Field.displayName = "Field";

const FieldContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props} />
  );
});
FieldContent.displayName = "FieldContent";

const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentProps<"label">
>(({ className, ...props }, ref) => {
  return (
    <label
      htmlFor="input"
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
});
FieldLabel.displayName = "FieldLabel";

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FieldDescription.displayName = "FieldDescription";

const FieldError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    errors?: unknown[];
  }
>(({ className, errors, ...props }, ref) => {
  if (!errors || errors.length === 0) return null;
  
  // Extract error message from various error formats
  const getErrorMessage = (error: unknown): string | null => {
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
      if ("message" in error && typeof error.message === "string") {
        return error.message;
      }
    }
    return null;
  };
  
  const errorMessage = errors
    .map(getErrorMessage)
    .find((msg): msg is string => msg !== null);
    
  if (!errorMessage) return null;
  
  return (
    <p
      ref={ref}
      className={cn("text-sm text-destructive", className)}
      {...props}
    >
      {errorMessage}
    </p>
  );
});
FieldError.displayName = "FieldError";

const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
});
FieldGroup.displayName = "FieldGroup";

const FieldSet = React.forwardRef<
  HTMLFieldSetElement,
  React.ComponentProps<"fieldset">
>(({ className, ...props }, ref) => {
  return (
    <fieldset
      ref={ref}
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
});
FieldSet.displayName = "FieldSet";

const FieldLegend = React.forwardRef<
  HTMLLegendElement,
  React.ComponentProps<"legend"> & {
    variant?: "default" | "label";
  }
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <legend
      ref={ref}
      className={cn(
        variant === "label"
          ? "text-sm font-medium leading-none"
          : "text-base font-semibold",
        className
      )}
      {...props}
    />
  );
});
FieldLegend.displayName = "FieldLegend";

const FieldTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
});
FieldTitle.displayName = "FieldTitle";

export {
  Field,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldTitle,
};

