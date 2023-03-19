import { Client } from '@notionhq/client'
import {
  BlockObjectResponse,
  PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints'

interface ChildrenProperty {
  children?: BlockObjectResponse[]
}

type BlockObjectResponseWithChildren = BlockObjectResponse & ChildrenProperty

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export const getPublishedPosts = async () => {
  const databaseId = process.env.NOTION_DATABASE_ID || ''

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Published',
      checkbox: {
        equals: true,
      },
    },
  })

  return response.results
}

export const getPageContent = async (
  pageId: string,
): Promise<BlockObjectResponseWithChildren[]> => {
  const response = await notion.blocks.children.list({ block_id: pageId })
  const content = response.results as BlockObjectResponseWithChildren[]

  for (const block of content) {
    if (block.has_children) {
      const childBlocks = await getBlockChildren(block.id)
      if (childBlocks.length > 0) {
        block.children = await Promise.all(
          childBlocks.map(
            async (childBlock: BlockObjectResponseWithChildren) => {
              if (childBlock.has_children) {
                const nestedChildBlocks = await getPageContent(childBlock.id)
                childBlock.children = nestedChildBlocks
              }
              return childBlock
            },
          ),
        )
      }
    }
  }

  return content
}

export async function getPostById(postId: string) {
  const post = (await notion.pages.retrieve({
    page_id: postId,
  })) as PageObjectResponse

  if (
    post.properties.Published.type === 'checkbox' &&
    !post.properties.Published.checkbox
  ) {
    throw new Error('Post not published')
  }

  return post
}

export const getBlockChildren = async (
  blockId: string,
): Promise<BlockObjectResponse[]> => {
  const response = await notion.blocks.children.list({ block_id: blockId })
  const childBlocks = response.results as BlockObjectResponse[]

  return childBlocks
}
