import Head from 'next/head'
import Link from 'next/link'
import React, { ReactNode } from 'react'

type PostsProps = {
  title: string
  created_time: string
  children: ReactNode
}

const Post: React.FC<PostsProps> = ({ title, created_time, children }) => (
  <>
    <Head>
      <title>{title}</title>
    </Head>
    <div className='max-w-8xl mx-auto'>
      <div className='flex px-4 pt-8 pb-10 lg:px-8'>
        <Link
          className='group flex font-semibold text-sm leading-6 text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white'
          href='/'
        >
          <svg
            viewBox='0 -9 3 24'
            className='overflow-visible mr-3 text-slate-400 w-auto h-6 group-hover:text-slate-600 dark:group-hover:text-slate-300'
          >
            <path
              d='M3 0L0 3L3 6'
              fill='none'
              stroke='currentColor'
              stroke-width='2'
              stroke-linecap='round'
              stroke-linejoin='round'
            ></path>
          </svg>
          Go back
        </Link>
      </div>
    </div>
    <div className='px-4 sm:px-6 md:px-8'>
      <div className='max-w-3xl mx-auto pb-28'>
        <main>
          <article className='relative pt-10'>
            <h1 className='text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-200 md:text-3xl '>
              {title}
            </h1>
            <div className='text-sm leading-6'>
              <dl>
                <dt className='sr-only'>Date</dt>
                <dd className='absolute top-0 inset-x-0 text-slate-700 dark:text-slate-400'>
                  <time dateTime={created_time}>{created_time}</time>
                </dd>
              </dl>
            </div>
            <div className='mt-12 prose prose-slate dark:prose-dark'>
              {children}
            </div>
          </article>
        </main>
      </div>
    </div>
  </>
)

export default Post
