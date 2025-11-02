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

  useEffect(() => {
    let isMounted = true

    const fetchProducts = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase.from('products').select('*')
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

    fetchProducts()
    return () => {
      isMounted = false
    }
  }, [])

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