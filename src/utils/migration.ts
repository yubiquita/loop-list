import type { ChecklistItem } from '../types'

/**
 * フラットなチェックリスト項目（indentプロパティを持つ）を、
 * subItemsプロパティを持つネストされた構造に変換します。
 */
export function migrateFlatToNested(items: ChecklistItem[]): ChecklistItem[] {
  const result: ChecklistItem[] = []
  let lastTopLevelItem: ChecklistItem | null = null

  items.forEach(item => {
    // 新しいオブジェクトとしてコピーし、既存のsubItemsを保持または初期化
    const newItem: ChecklistItem = {
      ...item,
      subItems: item.subItems ? [...item.subItems] : []
    }

    if (newItem.indent) {
      // インデントされている場合、直前のトップレベル項目の子要素にする
      // indentプロパティは不要になるので削除
      delete newItem.indent

      if (lastTopLevelItem) {
        lastTopLevelItem.subItems!.push(newItem)
      } else {
        // 直前にトップレベル項目がない場合は、そのままトップレベルとして扱う
        result.push(newItem)
        lastTopLevelItem = newItem
      }
    } else {
      // トップレベル項目の場合
      // indentプロパティが明示的に false の場合も削除しておく
      delete newItem.indent
      
      result.push(newItem)
      lastTopLevelItem = newItem
    }
  })

  return result
}
