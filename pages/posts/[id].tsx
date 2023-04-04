/* eslint-disable @next/next/no-img-element */
import { json } from 'stream/consumers'
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
import { render } from 'react-dom'
import { Code } from '@/components/Code'
import { Divider } from '@/components/Divider'
import { Embed } from '@/components/Embed'
import { Heading } from '@/components/Heading'
import Post from '@/components/Layout/Post'
import { Paragraph } from '@/components/Paragraph'
import { Quote } from '@/components/Quote'
import { Text } from '@/components/Text'
import { ToDo } from '@/components/ToDo'
import { Toggle } from '@/components/Toggle'
import { Video } from '@/components/Video'
import { getPublishedPosts, getPostById, getPageContent } from '@/lib/notion'

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

const isChildBlock = (
  block: BlockObjectResponse,
  parent_id: string,
): boolean => {
  return (
    (block.parent.type === 'page_id' && block.parent.page_id === parent_id) ||
    (block.parent.type === 'block_id' && block.parent.block_id === parent_id)
  )
}

const renderBlocks = (
  blocks: BlockObjectResponse[],
  parent_id: string,
): React.ReactNode[] => {
  const renderedBlocks: React.ReactNode[] = []

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]

    if (!isChildBlock(block, parent_id)) continue

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
    } else if (block.has_children) {
      const childItems = renderBlocks(blocks, block.id)
      renderedBlocks.push(
        <RenderBlock key={block.id} block={block}>
          {childItems}
        </RenderBlock>,
      )
    } else {
      renderedBlocks.push(<RenderBlock key={block.id} block={block} />)
    }
  }
  return renderedBlocks
}

const RenderBlock: React.FC<{
  block: BlockObjectResponse
  children?: React.ReactNode
}> = ({ block, children }) => {
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
      const summary = <Text rich_text={block.toggle.rich_text} />
      return (
        <Toggle id={block.id} summary={summary}>
          {children}
        </Toggle>
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
      return (
        <table>
          <tbody>{children}</tbody>
        </table>
      )
    case 'table_row':
      return (
        <tr key={block.id}>
          {block.table_row.cells.map(
            (cell: RichTextItemResponse[], cellIndex: number) => (
              <td key={`${block.id}-${cellIndex}`}>
                <span>{<Text rich_text={cell} />}</span>
              </td>
            ),
          )}
        </tr>
      )
    case 'column_list':
      return <div className='flex'>{children}</div>
    case 'column':
      return <div className='flex-1'>{children}</div>
    case 'file': //TODO
    case 'child_page': //TODO
      return null
    case 'embed':
      return <Embed url={block.embed.url} />
    case 'video':
      if (block.video.type === 'external') {
        return (
          <Video id={block.id} type='external' url={block.video.external.url} />
        )
      } else {
        return <Video id={block.id} type='file' url={block.video.file.url} />
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
      {renderBlocks(blocks, post.id)}
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
