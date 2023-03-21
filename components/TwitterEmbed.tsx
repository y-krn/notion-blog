// components/TwitterEmbed.tsx
import React from 'react'

interface TwitterEmbedProps {
  tweetUrl: string
}

const TwitterEmbed: React.FC<TwitterEmbedProps> = ({ tweetUrl }) => {
  return (
    <blockquote className='twitter-tweet'>
      <a href={tweetUrl}></a>
    </blockquote>
  )
}

export default TwitterEmbed
