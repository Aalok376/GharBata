import React, { forwardRef } from "react";
import { cva } from "class-variance-authority";
import cn from "classnames";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "h-8 w-8",
        default: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const Avatar = forwardRef(function Avatar({ className, size, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={cn(avatarVariants({ size, className }))}
      {...props}
    />
  );
});
Avatar.displayName = "Avatar";

const AvatarImage = forwardRef(function AvatarImage(props, ref) {
  const { className, ...rest } = props;
  return (
    <img
      ref={ref}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...rest}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = forwardRef(function AvatarFallback(props, ref) {
  const { className, ...rest } = props;
  return (
    <span
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...rest}
    />
  );
});
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
