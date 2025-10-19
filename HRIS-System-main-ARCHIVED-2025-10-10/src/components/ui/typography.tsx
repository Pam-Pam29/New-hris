import * as React from "react";
import { cn } from "../../lib/utils";

function createComponent<T extends HTMLElement>(
  tag: keyof React.JSX.IntrinsicElements,
  defaultClassName: string,
  displayName: string
) {
  const Comp = React.forwardRef<T, React.HTMLAttributes<T>>((props, ref) => (
    React.createElement(
      tag,
      { ...props, ref, className: cn(defaultClassName, props.className) },
      props.children
    )
  ));
  Comp.displayName = displayName;
  return Comp;
}

export const TypographyH1 = createComponent<HTMLHeadingElement>(
  "h1",
  "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground",
  "TypographyH1"
);

export const TypographyH2 = createComponent<HTMLHeadingElement>(
  "h2",
  "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-foreground",
  "TypographyH2"
);

export const TypographyH3 = createComponent<HTMLHeadingElement>(
  "h3",
  "scroll-m-20 text-2xl font-semibold tracking-tight text-foreground",
  "TypographyH3"
);

export const TypographyH4 = createComponent<HTMLHeadingElement>(
  "h4",
  "scroll-m-20 text-xl font-semibold tracking-tight text-foreground",
  "TypographyH4"
);

export const TypographyP = createComponent<HTMLParagraphElement>(
  "p",
  "leading-7 [&:not(:first-child)]:mt-6 text-foreground",
  "TypographyP"
);

export const TypographySmall = createComponent<HTMLParagraphElement>(
  "p",
  "text-sm font-medium leading-none text-foreground",
  "TypographySmall"
);

export const TypographyMuted = createComponent<HTMLSpanElement>(
  "span",
  "text-sm text-muted-foreground",
  "TypographyMuted"
); 