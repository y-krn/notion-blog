import type { NextPage, GetStaticProps } from 'next'
import Link from 'next/link'
import { getPublishedPosts } from '../lib/notion'

interface Post {
  id: string
  created_time: string
  properties: {
    Title: { title: { plain_text: string }[] }
    Tags: { multi_select: { name: string }[] }
    Published: { checkbox: boolean }
  }
}

interface HomeProps {
  posts: Post[]
}

const Home: NextPage<HomeProps> = ({ posts }) => {
  return (
    <>
      <div className='space-y-2 pt-6 pb-8 md:space-y-5'>
        <h1 className='text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14'>
          Latest
        </h1>
        <p className='text-lg leading-7 text-gray-500 dark:text-gray-400'>
          A blog created with Next.js and Tailwind.css
        </p>
      </div>
      <ul>
        {posts.map((post) => (
          <li key={post.id} className='py-12'>
            <article>
              <div className='space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0'>
                <dl>
                  <dt className='sr-only'>Published on</dt>
                  <dd className='text-base font-medium leading-6 text-gray-500 dark:text-gray-400'>
                    <time dateTime='{post.created_time}'>
                      {post.created_time}
                    </time>
                  </dd>
                </dl>
                <div className='space-y-5 xl:col-span-3'>
                  <div className='space-y-6'>
                    <div>
                      <h2 className='text-3xl font-bold leading-8 tracking-tight'>
                        <Link
                          href={`/posts/${post.id}`}
                          className='text-gray-900 dark:text-gray-100'
                        >
                          {post.properties.Title.title[0].plain_text}
                        </Link>
                      </h2>
                      <div className='flex flex-wrap'>
                        {post.properties.Tags.multi_select.map((tag) => (
                          <Link
                            key={post.id}
                            href={`/posts/${post.id}`}
                            className='mr-3 text-sm font-medium uppercase text-primary-500 hover:text-primary-600 dark:hover:text-primary-400'
                          >
                            {tag.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className='prose max-w-none text-gray-500 dark:text-gray-400'>
                      An overview of the new features released in v1 - code
                      block copy, multiple authors, frontmatter layout and more
                    </div>
                  </div>
                  <div className='text-base font-medium leading-6'>
                    <Link
                      href={`/posts/${post.id}`}
                      className='text-primary-500 hover:text-primary-600 dark:hover:text-primary-400'
                    >
                      Read more →
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
      <div className='flex justify-end text-base font-medium leading-6'>
        <Link
          className='text-primary-500 hover:text-primary-600 dark:hover:text-primary-400'
          href='/'
        >
          All Posts →
        </Link>
      </div>
    </>
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

export default Home
