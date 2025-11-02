'use client'

import { useState } from 'react'
import { supabase } from '../utils/supabase'
import s from '../pages/styles.module.scss'

type Props = {
  productId: string
  productName: string
  currentQty: number
  onClose: () => void
  onSold: (updatedProduct: any) => void
}

export default function SellModal({ productId, productName, currentQty, onClose, onSold }: Props) {
  const [sold, setSold] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    if (sold <= 0) {
      setError('Введите положительное количество')
      return
    }
    if (sold > currentQty) {
      setError('Нельзя продать больше, чем есть на складе')
      return
    }
    setLoading(true)
    try {
      const newQty = currentQty - sold
      const res = await supabase.from('products').update({ quantity: newQty }).eq('id', productId).select()
      const { data, error } = res as any
      if (error) {
        setError(error.message)
        return
      }
      const updated = Array.isArray(data) ? data[0] : data
      onSold(updated)
    } catch (err: any) {
      setError(err?.message ?? 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={s.modal} role="dialog" aria-modal="true">
      <div className={s.modalContent}>
        <button className={s.modalClose} onClick={onClose}>×</button>
        <h3 style={{ marginBottom: 12 }}>Продать: {productName}</h3>
        <p style={{ marginBottom: 8 }}>На складе: {currentQty} шт.</p>
        <input
          type="number"
          value={sold}
          min={0}
          onChange={(e) => setSold(Number(e.target.value))}
          style={{ width: '100%', padding: 8, marginBottom: 10, boxSizing: 'border-box' }}
          placeholder="Количество проданных"
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} className={s.reset}>Отмена</button>
          <button onClick={handleSubmit} disabled={loading} className={s.addButton} style={{ background: '#2563eb' }}>
            {loading ? 'Сохранение...' : 'Продать'}
          </button>
        </div>
        {error && <p style={{ color: '#ef4444', marginTop: 10 }}>{error}</p>}
      </div>
    </div>
  )
}