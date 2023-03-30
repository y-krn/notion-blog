import {
  RichTextItemResponse,
  TextRichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints'
import Link from 'next/link'
import React from 'react'

type Props = { rich_text: RichTextItemResponse[] }
type ApiColor =
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
  color: ApiColor
}
function _isTextRichTextItemResponse(
  text: RichTextItemResponse[],
): text is TextRichTextItemResponse[] {
  return text.every((v) => v.type === 'text')
}

function _getColorValue(color: ApiColor): string {
  const colorMap: { [key in ApiColor]: string } = {
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

function _applyAnnotations(text: string, annotations: Annotations) {
  const colorClass = _getColorValue(annotations.color)

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

function _renderRichText(richTextItems: RichTextItemResponse[]) {
  return richTextItems.map((item, index) => {
    const annotations = item.annotations
    const text = item.plain_text
    const decoratedText = _applyAnnotations(text, annotations)

    const link = item.href
    if (link) {
      return (
        <Link href={link} key={index}>
          {decoratedText}
        </Link>
      )
    }

    return <React.Fragment key={index}>{decoratedText}</React.Fragment>
  })
}

export const Text: React.FC<Props> = ({ rich_text }) => {
  if (!_isTextRichTextItemResponse(rich_text)) return null
  return <>{_renderRichText(rich_text)}</>
}
