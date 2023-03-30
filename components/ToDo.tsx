import { ReactNode } from 'react'

type Props = {
  id: string
  checked: boolean
  children?: ReactNode
}

export const ToDo = ({ id, checked, children }: Props) => {
  return (
    <div key={id}>
      <input
        type='checkbox'
        id={`to-do-${id}`}
        defaultChecked={checked}
        disabled
      />
      <label htmlFor={`to-do-${id}`}>{children}</label>
    </div>
  )
}
