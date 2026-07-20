import { createContext, useContext, useState, type ReactNode } from "react"

export interface Heading {
  id: string
  text: string
  level: number
}

interface TocValue {
  headings: Heading[]
  setHeadings: (h: Heading[]) => void
}

const TocContext = createContext<TocValue>({
  headings: [],
  setHeadings: () => {},
})

export function TocProvider({ children }: { children: ReactNode }) {
  const [headings, setHeadings] = useState<Heading[]>([])
  return (
    <TocContext.Provider value={{ headings, setHeadings }}>
      {children}
    </TocContext.Provider>
  )
}

export function useToc() {
  return useContext(TocContext)
}
