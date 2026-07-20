import type { ComponentProps, ReactNode } from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Callout } from "./callout"
import { Pre } from "./code-block"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Card,
  CardGroup,
  CodeGroup,
  ParamField,
  ResponseField,
  Step,
  Steps,
  Tab,
  Tabs,
} from "./mdx-widgets"

function SmartLink({ href = "", children, ...rest }: ComponentProps<"a">) {
  if (href.startsWith("/")) {
    return (
      <Link to={href} {...(rest as object)}>
        {children}
      </Link>
    )
  }
  const external = href.startsWith("http")
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      {...rest}
    >
      {children}
    </a>
  )
}

function AccordionGroup({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 divide-y divide-border rounded-xl border border-border px-4">
      {children}
    </div>
  )
}

function DocAccordion({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item" className="border-0">
        <AccordionTrigger>{title}</AccordionTrigger>
        <AccordionContent>
          <div className="prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            {children}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export const mdxComponents = {
  a: SmartLink,
  pre: Pre,
  table: (props: ComponentProps<"table">) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-sm [&_td]:border-t [&_td]:border-border [&_td]:px-4 [&_td]:py-2.5 [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_thead]:bg-muted/40" {...props} />
    </div>
  ),
  hr: (props: ComponentProps<"hr">) => (
    <hr className="my-10 border-border" {...props} />
  ),
  img: ({ className, ...props }: ComponentProps<"img">) => (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      className={cn("my-6 rounded-xl border border-border", className)}
      loading="lazy"
      {...props}
    />
  ),

  // Mintlify-style content components
  Note: (p: { children: ReactNode }) => <Callout variant="note" {...p} />,
  Info: (p: { children: ReactNode }) => <Callout variant="info" {...p} />,
  Tip: (p: { children: ReactNode }) => <Callout variant="tip" {...p} />,
  Check: (p: { children: ReactNode }) => <Callout variant="check" {...p} />,
  Warning: (p: { children: ReactNode }) => <Callout variant="warning" {...p} />,
  Danger: (p: { children: ReactNode }) => <Callout variant="danger" {...p} />,
  Callout,
  Card,
  CardGroup,
  Steps,
  Step,
  Tabs,
  Tab,
  CodeGroup,
  ParamField,
  ResponseField,
  AccordionGroup,
  Accordion: DocAccordion,
}

export type MdxComponents = typeof mdxComponents
