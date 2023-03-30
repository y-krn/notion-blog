/* eslint-disable @next/next/no-img-element */
import {
  BlockObjectResponse,
  BulletedListItemBlockObjectResponse,
  NumberedListItemBlockObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints'
import type { NextPage, GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { Code } from '@/components/Code'
import { Divider } from '@/components/Divider'
import { Heading } from '@/components/Heading'
import Post from '@/components/Layout/Post'
import { Paragraph } from '@/components/Paragraph'
import { Quote } from '@/components/Quote'
import { Text } from '@/components/Text'
import { ToDo } from '@/components/ToDo'
import { getPublishedPosts, getPostById, getPageContent } from '@/lib/notion'

interface ChildrenProperty {
  children?: BlockObjectResponse[]
}

type BlockObjectResponseWithChildren = BlockObjectResponse & ChildrenProperty

interface Post {
  id: string
  created_time: string
  properties: {
    Title: { title: { plain_text: string }[] }
    Tags: { multi_select: { name: string }[] }
    Published: { checkbox: boolean }
  }
}

interface PostPageProps {
  post: Post
  blocks: BlockObjectResponse[]
}

const renderBlocks = (
  blocks: BlockObjectResponseWithChildren[],
): React.ReactNode[] => {
  const renderedBlocks: React.ReactNode[] = []

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]

    if (block.type === 'bulleted_list_item') {
      const listItems: React.ReactNode[] = []

      while (i < blocks.length && blocks[i].type === 'bulleted_list_item') {
        const nextBlock = blocks[i] as BulletedListItemBlockObjectResponse
        listItems.push(
          <li key={nextBlock.id}>
            {nextBlock.bulleted_list_item.rich_text[0]?.plain_text || ''}
          </li>,
        )
        i++
      }

      // Decrement index to account for the last non-list block encountered
      i--

      renderedBlocks.push(<ul key={block.id}>{listItems}</ul>)
    } else if (block.type === 'numbered_list_item') {
      const listItems: React.ReactNode[] = []

      while (i < blocks.length && blocks[i].type === 'numbered_list_item') {
        const nextBlock = blocks[i] as NumberedListItemBlockObjectResponse
        listItems.push(
          <li key={nextBlock.id}>
            {nextBlock.numbered_list_item.rich_text[0]?.plain_text || ''}
          </li>,
        )
        i++
      }

      // Decrement index to account for the last non-list block encountered
      i--

      renderedBlocks.push(<ol key={block.id}>{listItems}</ol>)
    } else {
      renderedBlocks.push(<RenderBlock key={block.id} block={block} />)
    }
  }
  return renderedBlocks
}

const RenderBlock: React.FC<{ block: BlockObjectResponseWithChildren }> = ({
  block,
}) => {
  const convertToEmbedURL = (url: string) => {
    const regex = /^https:\/\/www\.youtube\.com\/watch\?v=(.+)$/
    const match = url.match(regex)

    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`
    }

    return url
  }

  switch (block.type) {
    case 'paragraph':
      return (
        <Paragraph>
          <Text rich_text={block.paragraph.rich_text} />
        </Paragraph>
      )
    case 'heading_1':
      return (
        <Heading level={1} id={block.id}>
          <Text rich_text={block.heading_1.rich_text} />
        </Heading>
      )
    case 'heading_2':
      return (
        <Heading level={2} id={block.id}>
          <Text rich_text={block.heading_2.rich_text} />
        </Heading>
      )
    case 'heading_3':
      return (
        <Heading level={3} id={block.id}>
          <Text rich_text={block.heading_3.rich_text} />
        </Heading>
      )
    case 'to_do':
      return (
        <ToDo id={block.id} checked={block.to_do.checked}>
          <Text rich_text={block.to_do.rich_text} />
        </ToDo>
      )
    case 'divider':
      return <Divider id={block.id} />
    case 'quote':
      return (
        <Quote id={block.id}>
          <Text rich_text={block.quote.rich_text} />
        </Quote>
      )
    case 'toggle':
      return (
        <details key={block.id}>
          <summary>
            <Text rich_text={block.toggle.rich_text} />
          </summary>
          {block.children && renderBlocks(block.children)}
        </details>
      )
    case 'code':
      const code = block.code.rich_text[0].plain_text
      const language = block.code.language || 'text'

      return <Code language={language} code={code} />
    case 'image':
      const imageUrl =
        block.image.type === 'external'
          ? block.image.external.url
          : block.image.file.url
      const caption = block.image.caption

      return (
        <figure key={block.id}>
          <img src={imageUrl} alt={caption ? caption[0]?.plain_text : ''} />
          {caption && <figcaption>{caption[0]?.plain_text}</figcaption>}{' '}
        </figure>
      )
    case 'table':
      const { has_column_header, has_row_header, table_width } = block.table
      const rows = block.children

      return (
        <table>
          <tbody>
            {rows?.map((row, rowIndex: number) => (
              <tr key={row.id}>
                {row.type === 'table_row' &&
                  row.table_row.cells.map(
                    (cell: RichTextItemResponse[], cellIndex: number) => (
                      <td key={`${row.id}-${cellIndex}`}>
                        {has_row_header && cellIndex === 0 && (
                          <strong>{cell[0].plain_text}</strong>
                        )}
                        {has_column_header && rowIndex === 0 && (
                          <strong>{cell[0].plain_text}</strong>
                        )}
                        {rowIndex !== 0 && <span>{cell[0].plain_text}</span>}
                      </td>
                    ),
                  )}
              </tr>
            ))}
          </tbody>
        </table>
      )
    case 'column_list':
      return (
        <div className='flex'>
          {block.children?.map((column: BlockObjectResponseWithChildren) => (
            <div key={column.id} className='flex-1'>
              {column.children?.map((childBlock) => (
                <RenderBlock key={childBlock.id} block={childBlock} />
              ))}
            </div>
          ))}
        </div>
      )
    case 'file': //TODO
    case 'child_page': //TODO
      return null
    case 'embed':
      return (
        <blockquote className='twitter-tweet'>
          <Link href={block.embed.url}></Link>
        </blockquote>
      )
    case 'video':
      if (block.video.type === 'external') {
        const embedUrl = convertToEmbedURL(block.video.external.url)
        return (
          <div>
            <iframe
              src={embedUrl}
              title={`Video: ${block.id}`}
              allowFullScreen
            ></iframe>
          </div>
        )
      } else {
        return (
          <div>
            <video src={block.video.file.url} controls />
          </div>
        )
      }
    default:
      return <p key={block.id}>Unsupported block type. {block.type}</p>
  }
}

const PostPage: NextPage<PostPageProps> = ({ post, blocks }) => {
  const router = useRouter()

  if (router.isFallback) {
    return <div>Loading...</div>
  }

  return (
    <Post
      title={post.properties.Title.title[0].plain_text}
      created_time={post.created_time}
    >
      {renderBlocks(blocks)}
    </Post>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPublishedPosts()
  const paths = posts.map((post) => ({ params: { id: post.id } }))

  return {
    paths,
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = await getPostById(params!.id as string)
  const blocks = await getPageContent(params!.id as string)

  return {
    props: {
      post,
      blocks,
    },
    revalidate: 1,
  }
}

export default PostPage
