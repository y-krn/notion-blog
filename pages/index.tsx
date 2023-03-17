import type { NextPage, GetStaticProps } from 'next'
import Link from 'next/link'
import { getPublishedPosts } from '../lib/notion'

interface Post {
  id: string
  properties: {
    Title: { title: { plain_text: string }[] }
    Tags: { multi_select: { name: string }[] }
    Published: { checkbox: boolean }
  }
}

interface HomePageProps {
  posts: Post[]
}

const HomePage: NextPage<HomePageProps> = ({ posts }) => {
  return (
    <div>
      <h1>Blog Posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link href={`/posts/${post.id}`}>
              <h2>{post.properties.Title.title[0].plain_text}</h2>
            </Link>
            <p>
              Tags:{' '}
              {post.properties.Tags.multi_select
                .map((tag) => tag.name)
                .join(', ')}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const posts = await getPublishedPosts()

  return {
    props: {
      posts,
    },
    revalidate: 1,
  }
}

export default HomePage
