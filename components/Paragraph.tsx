import { ReactNode } from 'react'

type Props = {
  children?: ReactNode
}

export const Paragraph = ({ children }: Props) => {
  return <p>{children}</p>
}
