import {
  BlockObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints'
import type { NextPage, GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { getPublishedPosts, getPostById, getPageContent } from '@/lib/notion'

type Color =
  | 'default'
  | 'gray'
  | 'brown'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'gray_background'
  | 'brown_background'
  | 'orange_background'
  | 'yellow_background'
  | 'green_background'
  | 'blue_background'
  | 'purple_background'
  | 'pink_background'
  | 'red_background'

type Annotations = {
  bold: boolean
  italic: boolean
  strikethrough: boolean
  underline: boolean
  code: boolean
  color: Color
}

interface Post {
  id: string
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

const applyAnnotations = (text: string, annotations: Annotations) => {
  const colorClass = getColorValue(annotations.color)

  let decoratedText = <span className={colorClass}>{text}</span>

  if (annotations.bold) {
    decoratedText = <strong>{decoratedText}</strong>
  }
  if (annotations.italic) {
    decoratedText = <em>{decoratedText}</em>
  }
  if (annotations.strikethrough) {
    decoratedText = <del>{decoratedText}</del>
  }
  if (annotations.underline) {
    decoratedText = <u>{decoratedText}</u>
  }
  if (annotations.code) {
    decoratedText = <code>{decoratedText}</code>
  }

  return decoratedText
}

const getColorValue = (color: Color): string => {
  const colorMap: { [key in Color]: string } = {
    default: 'text-inherit',
    gray: 'text-gray-500',
    brown: 'text-brown-500',
    orange: 'text-orange-500',
    yellow: 'text-yellow-500',
    green: 'text-green-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    pink: 'text-pink-500',
    red: 'text-red-500',
    gray_background: 'bg-gray-500',
    brown_background: 'bg-brown-500',
    orange_background: 'bg-orange-500',
    yellow_background: 'bg-yellow-500',
    green_background: 'bg-green-500',
    blue_background: 'bg-blue-500',
    purple_background: 'bg-purple-500',
    pink_background: 'bg-pink-500',
    red_background: 'bg-red-500',
  }

  return colorMap[color] || 'inherit'
}

const renderBlocks = (blocks: BlockObjectResponse[]): React.ReactNode[] => {
  const renderedBlocks: React.ReactNode[] = []

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]

    if (block.type === 'bulleted_list_item') {
      const listItems: React.ReactNode[] = []

      while (i < blocks.length && blocks[i].type === 'bulleted_list_item') {
        listItems.push(
          <li key={blocks[i].id}>
            {blocks[i].bulleted_list_item.rich_text[0]?.plain_text || ''}
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
        listItems.push(
          <li key={blocks[i].id}>
            {blocks[i].numbered_list_item.rich_text[0]?.plain_text || ''}
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

const RenderBlock: React.FC<{ block: BlockObjectResponse }> = ({ block }) => {
  const [toggleState, setToggleState] = useState<{ [key: string]: boolean }>({})

  const handleToggleClick = (id: string) => {
    setToggleState((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }))
  }

  const renderRichText = (richTextItems: RichTextItemResponse[]) => {
    return richTextItems.map((item, index) => {
      const annotations = item.annotations
      const text = item.plain_text
      const decoratedText = applyAnnotations(text, annotations)

      const link = item.href
      if (link) {
        return (
          <a href={link} key={index}>
            {decoratedText}
          </a>
        )
      }

      return <React.Fragment key={index}>{decoratedText}</React.Fragment>
    })
  }
  switch (block.type) {
    case 'paragraph':
      return <p>{renderRichText(block.paragraph.rich_text)}</p>
    case 'heading_1':
      return <h1>{renderRichText(block.heading_1.rich_text)}</h1>
    case 'heading_2':
      return <h2>{renderRichText(block.heading_2.rich_text)}</h2>
    case 'heading_3':
      return <h3>{renderRichText(block.heading_3.rich_text)}</h3>
    case 'to_do':
      const toDoId = `to-do-${block.id}`
      const toDoText = renderRichText(block.to_do.rich_text) || ''

      return (
        <div key={block.id}>
          <input
            type='checkbox'
            id={toDoId}
            defaultChecked={block.to_do.checked}
            disabled
          />
          <label htmlFor={toDoId}>{toDoText}</label>
        </div>
      )
    case 'divider':
      return <hr key={block.id} />
    case 'quote':
      return (
        <blockquote key={block.id}>
          {renderRichText(block.quote.rich_text)}
        </blockquote>
      )
    case 'toggle':
      return (
        <details key={block.id}>
          <summary>{renderRichText(block.toggle.rich_text)}</summary>
          {block.children && renderBlocks(block.children)}
        </details>
      )
    case 'code':
      return (
        <pre key={block.id}>
          <code>{renderRichText(block.code.rich_text)}</code>
        </pre>
      )
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
      console.log(JSON.stringify(rows))

      return (
        <table>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.id}>
                {row.table_row.cells.map((cell, cellIndex) => (
                  <td key={`${row.id}-${cellIndex}`}>
                    {has_row_header && cellIndex === 0 && (
                      <strong>{cell[0].plain_text}</strong>
                    )}
                    {has_column_header && rowIndex === 0 && (
                      <strong>{cell[0].plain_text}</strong>
                    )}
                    {rowIndex !== 0 && <span>{cell[0].plain_text}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )
    case 'column_list':
      return (
        <div className='flex'>
          {block.children.map((column) => (
            <div key={column.id} className='flex-1'>
              {column.children &&
                column.children.map((childBlock) => (
                  <RenderBlock key={childBlock.id} block={childBlock} />
                ))}
            </div>
          ))}
        </div>
      )
    case 'file': //TODO
    case 'child_page': //TODO
      return ''
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
    <article className='prose lg:prose-xl container mx-auto'>
      <h1>{post.properties.Title.title[0].plain_text}</h1>
      <p>
        Tags:{' '}
        {post.properties.Tags.multi_select.map((tag) => tag.name).join(', ')}
      </p>
      {renderBlocks(blocks)}
    </article>
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
