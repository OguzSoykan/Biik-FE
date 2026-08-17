import client from './client'

/**
 * İlan = kullanıcının kendi adını verdiği özel aday listesi.
 * Dışarıya yayınlanmaz; yalnızca sahibi görür.
 */

export const getIlanlar = async () => {
  const res = await client.get('/ilanlar')
  return res.data                                   // {ilanlar: [...], durumlar: [...]}
}

export const createIlan = async (ad, departman = '') => {
  const res = await client.post('/ilanlar', { ad, departman })
  return res.data
}

export const getIlan = async (ilanId) => {
  const res = await client.get(`/ilanlar/${encodeURIComponent(ilanId)}`)
  return res.data                                   // {id, ad, adaylar: [...], durumlar}
}

/** İlanın adını ve/veya departmanını günceller (departman: '' etiketi kaldırır). */
export const updateIlan = async (ilanId, { ad, departman } = {}) => {
  const body = {}
  if (ad !== undefined) body.ad = ad
  if (departman !== undefined) body.departman = departman
  const res = await client.patch(`/ilanlar/${encodeURIComponent(ilanId)}`, body)
  return res.data
}

export const deleteIlan = async (ilanId) => {
  const res = await client.delete(`/ilanlar/${encodeURIComponent(ilanId)}`)
  return res.data
}

/** Adayı ilana ekler. Zaten varsa {eklendi: false} döner (hata değil). */
export const addAdayToIlan = async (ilanId, adayId) => {
  const res = await client.post(`/ilanlar/${encodeURIComponent(ilanId)}/adaylar`, {
    aday_id: adayId,
  })
  return res.data
}

export const removeAdayFromIlan = async (ilanId, adayId) => {
  const res = await client.delete(
    `/ilanlar/${encodeURIComponent(ilanId)}/adaylar/${encodeURIComponent(adayId)}`
  )
  return res.data
}

/** Adayın notunu ve/veya durumunu günceller (departman ilanın özelliğidir). */
export const updateAdayInIlan = async (ilanId, adayId, { notu, durum } = {}) => {
  const body = {}
  if (notu !== undefined) body.notu = notu
  if (durum !== undefined) body.durum = durum
  const res = await client.patch(
    `/ilanlar/${encodeURIComponent(ilanId)}/adaylar/${encodeURIComponent(adayId)}`,
    body
  )
  return res.data
}

export const reorderIlan = async (ilanId, adayIds) => {
  const res = await client.post(`/ilanlar/${encodeURIComponent(ilanId)}/siralama`, {
    aday_ids: adayIds,
  })
  return res.data
}

/** Bu aday hangi ilanlarda? (kartta 'kaydedildi' göstergesi için) */
export const getIlanlarOfAday = async (adayId) => {
  const res = await client.get(`/adaylar/${encodeURIComponent(adayId)}/ilanlar`)
  return res.data.ilan_ids
}
