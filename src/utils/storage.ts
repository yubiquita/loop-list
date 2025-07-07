// localStorage操作ユーティリティ

import type { ChecklistData } from '../types'
import { safeJSONParse, safeJSONStringify } from './index'

const STORAGE_KEY = 'checklistData'

/**
 * データをlocalStorageから読み込み
 */
export function loadData(): ChecklistData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return null
    
    // JSON.parseを直接使用してエラーを検出
    const parsed = JSON.parse(data) as ChecklistData
    return parsed.lists ? parsed : null
  } catch (error) {
    console.error('データの読み込みエラー:', error)
    throw error // エラーを再投げしてストアで処理させる
  }
}

/**
 * データをlocalStorageに保存
 */
export function saveData(data: ChecklistData): void {
  try {
    const jsonData = safeJSONStringify(data)
    localStorage.setItem(STORAGE_KEY, jsonData)
  } catch (error) {
    console.error('データの保存エラー:', error)
  }
}

/**
 * localStorage内のデータを削除
 */
export function clearData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('データの削除エラー:', error)
  }
}

/**
 * localStorage内にデータが存在するかチェック
 */
export function hasData(): boolean {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data !== null
  } catch (error) {
    console.error('データの確認エラー:', error)
    return false
  }
}

/**
 * データのバックアップを作成
 */
export function createBackup(): string | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data
  } catch (error) {
    console.error('バックアップの作成エラー:', error)
    return null
  }
}

/**
 * バックアップからデータを復元
 */
export function restoreBackup(backupData: string): boolean {
  try {
    const parsed = safeJSONParse<ChecklistData>(backupData, { lists: [] })
    if (!parsed.lists) return false
    
    saveData(parsed)
    return true
  } catch (error) {
    console.error('バックアップの復元エラー:', error)
    return false
  }
}

/**
 * ストレージ容量の確認
 */
export function getStorageInfo(): { used: number; total: number; available: number } {
  try {
    const data = localStorage.getItem(STORAGE_KEY) || ''
    const used = new Blob([data]).size
    const total = 5 * 1024 * 1024 // 5MB (一般的なlocalStorageの上限)
    const available = total - used
    
    return {
      used,
      total,
      available
    }
  } catch (error) {
    console.error('ストレージ情報の取得エラー:', error)
    return {
      used: 0,
      total: 0,
      available: 0
    }
  }
}