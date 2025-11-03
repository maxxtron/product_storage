// ...existing code...
'use client'

import { useState } from 'react'
import { supabase } from '../utils/supabase'
import s from '../pages/styles.module.scss'

type Props = {
  onClose?: () => void
  onAdded?: (product: any) => void
}

export default function AddProduct({ onClose, onAdded }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [quantity, setQuantity] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddProduct = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{ name, description, price, quantity }])
        .select()
        .single()

      if (error) {
        console.error('Ошибка добавления:', error)
        setError(error.message)
      } else {
        console.log('Добавлено:', data)
        setName('')
        setDescription('')
        setPrice(0)
        setQuantity(0)
        onAdded?.(data)
      }
    } catch (err: any) {
      setError(err?.message ?? 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={s.containerModal}>
      <h2>Добавить товар</h2>
      <div className={s.inputContainer}>
      <p>Название</p>
      <input
        placeholder="Название"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={s.inputAdd}
      />
      </div>
      {/* <input
        placeholder="Описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 mb-2 w-full"
      /> */}
      <div className={s.inputContainer}>
        <p>Цена</p>
      <input
        type="number"
        placeholder="Цена"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        className={s.inputAdd}
      />
      </div>
      <div className={s.inputContainer}>
        <p>Количество</p>
      <input
        type="number"
        placeholder="Количество"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className={s.inputAdd}
      />
</div>
      <div className="flex gap-2">
        <button
          onClick={handleAddProduct}
          disabled={loading}
          className={s.addButton}
        >
          {loading ? 'Добавление...' : 'Добавить'}
        </button>

        <button
          onClick={() => onClose?.()}
          className={`${s.addButton} ${s.addButtonCancel}`}
        >
          Отмена
        </button>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}
// ...existing code...