import { useNavigate } from "react-router-dom"
import { FileText } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { docsNav } from "@/lib/docs-nav"

export function DocsSearch({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()

  function go(slug: string) {
    onOpenChange(false)
    navigate(`/docs/${slug}`)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search documentation…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {docsNav.map((group) => (
          <CommandGroup key={group.group} heading={group.group}>
            {group.pages.map((page) => (
              <CommandItem
                key={page.slug}
                value={`${group.group} ${page.title} ${page.slug}`}
                onSelect={() => go(page.slug)}
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{page.title}</span>
                <span className="ml-auto font-mono text-xs text-muted-foreground">
                  /{page.slug}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
