// ...existing code...
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { Product } from '../types'
import s from './styles.module.scss'
import AddProduct from '../components/AddProduct'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [query, setQuery] = useState<string>('')

  useEffect(() => {
    let isMounted = true
    let timer: ReturnType<typeof setTimeout> | null = null

    const fetchProducts = async (q = '') => {
      if (isMounted) setLoading(true)
      try {
        const builder = supabase.from('products').select('*')
        const res = q.trim()
          ? await builder.ilike('name', `%${q.trim()}%`)
          : await builder
        const { data, error } = res as any
        if (!isMounted) return
        if (error) {
          setError(error.message)
          setProducts(null)
        } else {
          setProducts(data ?? [])
          setError(null)
        }
      } catch (err: any) {
        if (!isMounted) return
        setError(err?.message ?? 'Ошибка')
        setProducts(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    timer = setTimeout(() => fetchProducts(query), 300)

    return () => {
      isMounted = false
      if (timer) clearTimeout(timer)
    }
  }, [query])

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) return
    setDeletingId(id)
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) {
        alert(error.message)
        return
      }
      setProducts(prev => (prev ? prev.filter(p => String(p.id) !== String(id)) : null))
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) return <p className="p-6">Загрузка...</p>
  if (error) return <p className="p-6">Ошибка загрузки товаров: {error}</p>

  return (
    <div className={s.container}>
      <h1 className={s.title}>Список товаров</h1>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Поиск по названию"
          aria-label="Поиск по названию"
          style={{
            padding: '8px 10px',
            borderRadius: 6,
            border: '1px solid #ccc',
            width: 320
          }}
        />
        <button
          onClick={() => setQuery('')}
          style={{
            padding: '8px 10px',
            borderRadius: 6,
            border: '1px solid #ccc',
            background: '#f3f4f6',
            cursor: 'pointer'
          }}
        >
          Сброс
        </button>
      </div>

      <div className={s.about}>
        <p>Название</p>
        <p>Описание</p>
        <p>Цена</p>
        <p>Количество</p>
      </div>

      <ul className="space-y-2">
        {products && products.length > 0 ? (
          products.map(p => (
            <li key={p.id} className={s.list}>
              <p>{p.name}</p>
              <p>{p.description}</p>
              <p>{p.price}₴</p>
              <p>{p.quantity} шт.</p>
              <div>
                <button
                  onClick={() => handleDelete(String(p.id))}
                  disabled={deletingId === String(p.id)}
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 10px',
                    borderRadius: 6,
                    cursor: deletingId === String(p.id) ? 'default' : 'pointer'
                  }}
                  aria-label={`Удалить ${p.name}`}
                >
                  {deletingId === String(p.id) ? 'Удаление...' : 'Удалить'}
                </button>
              </div>
            </li>
          ))
        ) : (
          <p>Товары не найдены</p>
        )}
      </ul>

      <button className={s.addButton} onClick={() => setShowAddModal(true)} aria-label="Добавить товар">
        Добавить товар
      </button>

      {showAddModal && (
        <div className={s.modal} role="dialog" aria-modal="true">
          <div className={s.modalContent}>
            <button className={s.modalClose} onClick={() => setShowAddModal(false)}>
              ×
            </button>
            <AddProduct
              onClose={() => setShowAddModal(false)}
              onAdded={(newProduct: Product) => {
                setProducts(prev => (prev ? [...prev, newProduct] : [newProduct]))
                setShowAddModal(false)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
// ...existing code...