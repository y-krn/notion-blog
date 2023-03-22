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
    Description: { rich_text: { plain_text: string }[] }
  }
}

interface HomeProps {
  posts: Post[]
}

function formatDate(input: string) {
  return new Date(input).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const Home: NextPage<HomeProps> = ({ posts }) => {
  return (
    <main className='max-w-[52rem] mx-auto px-4 pb-28 sm:px-6 md:px-8 xl:px-12 lg:max-w-6xl'>
      <header className='py-16 sm:text-center'>
        <h1 className='mb-4 text-3xl sm:text-4xl tracking-tight text-slate-900 font-extrabold dark:text-slate-200'>
          Latest Updates
        </h1>
        <p className='text-lg text-slate-700 dark:text-slate-400'>
          All the latest Tailwind CSS news, straight from the&nbsp;team.
        </p>
      </header>
      <div className='relative sm:pb-12 sm:ml-[calc(2rem+1px)] md:ml-[calc(3.5rem+1px)] lg:ml-[max(calc(14.5rem+1px),calc(100%-48rem))]'>
        <div className='hidden absolute top-3 bottom-0 right-full mr-7 md:mr-[3.25rem] w-px bg-slate-200 dark:bg-slate-800 sm:block'></div>
        <div className='space-y-16'>
          {posts.map((post) => (
            <article key={post.id} className='relative group'>
              <div className='absolute -inset-y-2.5 -inset-x-4 md:-inset-y-4 md:-inset-x-6 sm:rounded-2xl group-hover:bg-slate-50/70 dark:group-hover:bg-slate-800/50'></div>
              <svg
                viewBox='0 0 9 9'
                className='hidden absolute right-full mr-6 top-2 text-slate-200 dark:text-slate-600 md:mr-12 w-[calc(0.5rem+1px)] h-[calc(0.5rem+1px)] overflow-visible sm:block'
              >
                <circle
                  cx='4.5'
                  cy='4.5'
                  r='4.5'
                  stroke='currentColor'
                  className='fill-white dark:fill-slate-900'
                  strokeWidth='2'
                ></circle>
              </svg>
              <div className='relative'>
                <h3 className='text-base font-semibold tracking-tight text-slate-900 dark:text-slate-200 pt-8 lg:pt-0'>
                  {post.properties.Title.title[0].plain_text}
                </h3>
                <div className='mt-2 mb-4 prose prose-slate prose-a:relative prose-a:z-10 dark:prose-dark line-clamp-2'>
                  <p>{post.properties.Description.rich_text[0]?.plain_text}</p>
                </div>
                <dl className='absolute left-0 top-0 lg:left-auto lg:right-full lg:mr-[calc(6.5rem+1px)]'>
                  <dt className='sr-only'>Date</dt>
                  <dd className='whitespace-nowrap text-sm leading-6 dark:text-slate-400'>
                    <time dateTime={post.created_time}>
                      {formatDate(post.created_time)}
                    </time>
                  </dd>
                </dl>
              </div>
              <Link
                className='flex items-center text-sm text-sky-500 font-medium'
                href={`/posts/${post.id}`}
              >
                <span className='absolute -inset-y-2.5 -inset-x-4 md:-inset-y-4 md:-inset-x-6 sm:rounded-2xl'></span>
                <span className='relative'>Read more</span>
                <svg
                  className='relative mt-px overflow-visible ml-2.5 text-sky-300 dark:text-sky-700'
                  width='3'
                  height='6'
                  viewBox='0 0 3 6'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M0 0L3 3L0 6'></path>
                </svg>
              </Link>
            </article>
          ))}
        </div>
      </div>
      <div className='flex justify-end text-base font-medium leading-6'>
        <Link
          className='text-primary-500 hover:text-primary-600 dark:hover:text-primary-400'
          href='/'
        >
          All Posts →
        </Link>
      </div>
    </main>
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
