import { ReactNode } from 'react'

type Props = {
  id: string
  summary: ReactNode
  children?: ReactNode
}

export const Toggle = ({ id, summary, children }: Props) => {
  return (
    <details key={id}>
      <summary>{summary}</summary>
      {children}
    </details>
  )
}
