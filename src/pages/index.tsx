// ...existing code...
'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../utils/supabase'
import { Product } from '../types'
import s from './styles.module.scss'
import AddProduct from '../components/AddProduct'
import accept from '../img/check-svgrepo-com.svg'
import cancel from '../img/cancel-svgrepo-com.svg'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [query, setQuery] = useState<string>('')
  const timerRef = useRef<number | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editFields, setEditFields] = useState<{ name: string; description: string; price: number; quantity: number } | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const fetchProducts = async (q = '') => {
    setLoading(true)
    try {
      const builder = supabase.from('products').select('*')
      const res = q.trim() ? await builder.ilike('name', `%${q.trim()}%`) : await builder
      const { data, error } = res as any
      if (error) {
        setError(error.message)
        setProducts(null)
      } else {
        setProducts(data ?? [])
        setError(null)
      }
    } catch (err: any) {
      setError(err?.message ?? 'Ошибка')
      setProducts(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts('')
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      fetchProducts(query)
    }, 500)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
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

  const handleEdit = (p: Product) => {
    setEditId(String(p.id))
    setEditFields({
      name: p.name ?? '',
      description: p.description ?? '',
      price: Number(p.price ?? 0),
      quantity: Number(p.quantity ?? 0)
    })
  }

  const handleCancelEdit = () => {
    setEditId(null)
    setEditFields(null)
  }

  const handleSaveEdit = async (id: string) => {
    if (!editFields) return
    setSavingId(id)
    try {
      const payload = {
        name: editFields.name,
        description: editFields.description,
        price: editFields.price,
        quantity: editFields.quantity
      }
      const res = await supabase.from('products').update(payload).eq('id', id).select()
      const { data, error } = res as any
      if (error) {
        alert(error.message)
        return
      }
      const updated = Array.isArray(data) ? data[0] : data
      setProducts(prev => prev ? prev.map(p => (String(p.id) === String(id) ? updated : p)) : [updated])
      setEditId(null)
      setEditFields(null)
    } finally {
      setSavingId(null)
    }
  }

  if (loading) return <p className="p-6">Загрузка...</p>
  if (error) return <p className="p-6">Ошибка загрузки товаров: {error}</p>

  return (
    <div className={s.container}>
      <h1 className={s.title}>Список товаров</h1>

      <div className={s.controls}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Поиск по названию"
          aria-label="Поиск по названию"
          className={s.search}
        />
        <button onClick={() => { setQuery(''); fetchProducts('') }} className={s.reset}>
          Сброс
        </button>
        <button className={s.addButton} onClick={() => setShowAddModal(true)} aria-label="Добавить товар">
          Добавить товар
        </button>
      </div>

      <div className={s.tableHeader}>
        <div>Название</div>
        <div>Описание</div>
        <div>Цена</div>
        <div>Количество</div>
        <div></div>
      </div>

      <ul className={s.listWrap}>
        {products && products.length > 0 ? (
          products.map(p => {
            const idStr = String(p.id)
            const isEditing = editId === idStr
            return (
              <li key={p.id} className={s.listRow}>
                <div className={s.cell}>
                  {isEditing ? (
                    <input
                      value={editFields?.name ?? ''}
                      onChange={e => setEditFields(prev => prev ? { ...prev, name: e.target.value } : prev)}
                      className={s.search}
                      style={{ padding: 6 }}
                    />
                  ) : (
                    p.name
                  )}
                </div>
                <div className={s.cell}>
                  {isEditing ? (
                    <input
                      value={editFields?.description ?? ''}
                      onChange={e => setEditFields(prev => prev ? { ...prev, description: e.target.value } : prev)}
                      className={s.search}
                      style={{ padding: 6 }}
                    />
                  ) : (
                    p.description
                  )}
                </div>
                <div className={s.cell}>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editFields?.price ?? 0}
                      onChange={e => setEditFields(prev => prev ? { ...prev, price: Number(e.target.value) } : prev)}
                      className={s.search}
                      style={{ padding: 6, width: 120 }}
                    />
                  ) : (
                    `${p.price}₴`
                  )}
                </div>
                <div className={s.cell}>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editFields?.quantity ?? 0}
                      onChange={e => setEditFields(prev => prev ? { ...prev, quantity: Number(e.target.value) } : prev)}
                      className={s.search}
                      style={{ padding: 6, width: 120 }}
                    />
                  ) : (
                    `${p.quantity} шт.`
                  )}
                </div>
                <div className={s.cell} style={{ display: 'flex', gap: 8 }}>
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(idStr)}
                        disabled={savingId === idStr}
                        className={s.addButton}
                        style={{background: '#f3f4f6',border: '1px solid #d1d5db',color: '#000'}}
                      >
                        {savingId === idStr ? 'Save' : <svg width="16px" height="16px" viewBox="0 -4 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>check</title> <desc>Created with Sketch.</desc> <defs> <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-1"> <stop stop-color="#1DD47F" offset="0%"> </stop> <stop stop-color="#0DA949" offset="100%"> </stop> </linearGradient> </defs> <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="ui-gambling-website-lined-icnos-casinoshunter" transform="translate(-735.000000, -1911.000000)" fill="url(#linearGradient-1)" fill-rule="nonzero"> <g id="4" transform="translate(50.000000, 1871.000000)"> <path d="M714.442949,40.6265241 C715.185684,41.4224314 715.185684,42.6860985 714.442949,43.4820059 L697.746773,61.3734759 C697.314529,61.8366655 696.704235,62.0580167 696.097259,61.9870953 C695.539848,62.0082805 694.995328,61.7852625 694.600813,61.3625035 L685.557051,51.6712906 C684.814316,50.8753832 684.814316,49.6117161 685.557051,48.8158087 C686.336607,47.9804433 687.631056,47.9804433 688.410591,48.8157854 L696.178719,57.1395081 L711.589388,40.6265241 C712.368944,39.7911586 713.663393,39.7911586 714.442949,40.6265241 Z" id="check"> </path> </g> </g> </g> </g></svg>}
                      </button>
                      <button onClick={handleCancelEdit} className={s.reset}><svg fill="#ff0000" width="24px" height="24px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#ff0000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>cancel2</title> <path d="M19.587 16.001l6.096 6.096c0.396 0.396 0.396 1.039 0 1.435l-2.151 2.151c-0.396 0.396-1.038 0.396-1.435 0l-6.097-6.096-6.097 6.096c-0.396 0.396-1.038 0.396-1.434 0l-2.152-2.151c-0.396-0.396-0.396-1.038 0-1.435l6.097-6.096-6.097-6.097c-0.396-0.396-0.396-1.039 0-1.435l2.153-2.151c0.396-0.396 1.038-0.396 1.434 0l6.096 6.097 6.097-6.097c0.396-0.396 1.038-0.396 1.435 0l2.151 2.152c0.396 0.396 0.396 1.038 0 1.435l-6.096 6.096z"></path> </g></svg></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(p)} className={s.addButton} style={{ background: '#f59e0b' }}>
                        <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M20.8477 1.87868C19.6761 0.707109 17.7766 0.707105 16.605 1.87868L2.44744 16.0363C2.02864 16.4551 1.74317 16.9885 1.62702 17.5692L1.03995 20.5046C0.760062 21.904 1.9939 23.1379 3.39334 22.858L6.32868 22.2709C6.90945 22.1548 7.44285 21.8693 7.86165 21.4505L22.0192 7.29289C23.1908 6.12132 23.1908 4.22183 22.0192 3.05025L20.8477 1.87868ZM18.0192 3.29289C18.4098 2.90237 19.0429 2.90237 19.4335 3.29289L20.605 4.46447C20.9956 4.85499 20.9956 5.48815 20.605 5.87868L17.9334 8.55027L15.3477 5.96448L18.0192 3.29289ZM13.9334 7.3787L3.86165 17.4505C3.72205 17.5901 3.6269 17.7679 3.58818 17.9615L3.00111 20.8968L5.93645 20.3097C6.13004 20.271 6.30784 20.1759 6.44744 20.0363L16.5192 9.96448L13.9334 7.3787Z" fill="#ffffff"></path> </g></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(idStr)}
                        disabled={deletingId === idStr}
                        className={s.deleteBtn}
                      >
                        {deletingId === idStr ? 'Удаление...' : <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10 12V17" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M14 12V17" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M4 7H20" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>}
                      </button>
                    </>
                  )}
                </div>
              </li>
            )
          })
        ) : (
          <li className={s.empty}>Товары не найдены</li>
        )}
      </ul>

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