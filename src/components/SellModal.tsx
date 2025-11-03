// ...existing code...
'use client'

import { useEffect, useState } from 'react'
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
  const [sold, setSold] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSold('')
    setError(null)
    setLoading(false)
  }, [productId])

  const handleChange = (value: string) => {
    const digits = value.replace(/\D/g, '')
    setSold(digits)
  }

  const handleSubmit = async () => {
    setError(null)
    const soldNum = Number(sold)
    if (!sold || Number.isNaN(soldNum) || soldNum <= 0) {
      setError('Введите положительное количество')
      return
    }
    if (soldNum > currentQty) {
      setError('Нельзя продать больше, чем есть на складе')
      return
    }
    setLoading(true)
    try {
      const newQty = currentQty - soldNum
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
          type="text"
          inputMode="numeric"
          value={sold}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { if (sold === '0') setSold('') }}
          placeholder="0"
          style={{border: '0.5px solid #d1d5db' , borderRadius: '6px', outline: 'none' ,width: '100%', padding: 8, marginBottom: 10, boxSizing: 'border-box' }}
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
// ...existing code...