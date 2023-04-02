type Props = {
  id: string
  type: string
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

export const Video = ({ id, type, url }: Props) => {
  if (type === 'external') {
    const embedUrl = convertToEmbedURL(url)
    return (
      <div>
        <iframe src={embedUrl} title={`Video: ${id}`} allowFullScreen></iframe>
      </div>
    )
  } else {
    return (
      <div>
        <video src={url} controls />
      </div>
    )
  }
}
