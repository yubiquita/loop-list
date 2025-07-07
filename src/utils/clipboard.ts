// クリップボード操作ユーティリティ

import type { ClipboardOptions } from '../types'

/**
 * テキストをクリップボードにコピー
 */
export async function copyToClipboard(options: ClipboardOptions): Promise<void> {
  const { text, onSuccess, onError } = options
  
  try {
    // 新しいClipboard APIを使用
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      onSuccess?.()
      return
    }
    
    // フォールバック: 古い方法
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'absolute'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    return new Promise((resolve, reject) => {
      const success = document.execCommand('copy')
      textArea.remove()
      
      if (success) {
        onSuccess?.()
        resolve()
      } else {
        const error = new Error('クリップボードへのコピーに失敗しました')
        onError?.(error)
        reject(error)
      }
    })
  } catch (error) {
    const err = error as Error
    onError?.(err)
    throw err
  }
}

/**
 * クリップボードからテキストを読み取り
 */
export async function readFromClipboard(): Promise<string> {
  try {
    // 新しいClipboard APIを使用
    if (navigator.clipboard && window.isSecureContext) {
      return await navigator.clipboard.readText()
    }
    
    // フォールバック: 古い方法（読み取り専用制限あり）
    throw new Error('クリップボードの読み取りがサポートされていません')
  } catch (error) {
    console.error('クリップボードの読み取りエラー:', error)
    throw error
  }
}

/**
 * クリップボードのサポート状況を確認
 */
export function isClipboardSupported(): boolean {
  return !!(navigator.clipboard && window.isSecureContext) || 
         document.queryCommandSupported('copy')
}

/**
 * リスト全体をテキスト形式でクリップボードにコピー
 */
export async function copyListAsText(
  listName: string,
  items: Array<{ text: string; checked: boolean }>
): Promise<void> {
  const listText = formatListAsText(listName, items)
  
  await copyToClipboard({
    text: listText,
    onSuccess: () => {
      console.log('リストをクリップボードにコピーしました')
    },
    onError: (error) => {
      console.error('リストのコピーに失敗しました:', error)
    }
  })
}

/**
 * リストをテキスト形式にフォーマット
 */
export function formatListAsText(
  listName: string,
  items: Array<{ text: string; checked: boolean }>
): string {
  const lines = [`# ${listName}`, '']
  
  items.forEach(item => {
    const checkbox = item.checked ? '✓' : '☐'
    lines.push(`${checkbox} ${item.text}`)
  })
  
  return lines.join('\n')
}

/**
 * リストをMarkdown形式にフォーマット
 */
export function formatListAsMarkdown(
  listName: string,
  items: Array<{ text: string; checked: boolean }>
): string {
  const lines = [`# ${listName}`, '']
  
  items.forEach(item => {
    const checkbox = item.checked ? '- [x]' : '- [ ]'
    lines.push(`${checkbox} ${item.text}`)
  })
  
  return lines.join('\n')
}

/**
 * リストをJSON形式にフォーマット
 */
export function formatListAsJSON(
  listName: string,
  items: Array<{ text: string; checked: boolean }>
): string {
  const data = {
    name: listName,
    items: items.map(item => ({
      text: item.text,
      checked: item.checked
    }))
  }
  
  return JSON.stringify(data, null, 2)
}