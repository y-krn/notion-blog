import { ReactNode } from 'react'

type Props = {
  id: string
  children?: ReactNode
}

export const Quote = ({ id, children }: Props) => {
  return <blockquote id={id}>{children}</blockquote>
}
