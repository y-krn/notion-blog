import Link from 'next/link'

type Props = {
  url: string
}

export const Embed = ({ url }: Props) => {
  return (
    <blockquote className='twitter-tweet'>
      <Link href={url}></Link>
    </blockquote>
  )
}
