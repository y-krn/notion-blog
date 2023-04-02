type Props = {
  id: string
  url: string
}

const convertToEmbedURL = (url: string) => {
  const regex = /^https:\/\/www\.youtube\.com\/watch\?v=(.+)$/
  const match = url.match(regex)

  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`
  }

  return url
}

export const Video = ({ id, url }: Props) => {
  const embedUrl = convertToEmbedURL(url)
  return (
    <div>
      <iframe src={embedUrl} title={`Video: ${id}`} allowFullScreen></iframe>
    </div>
  )
}
