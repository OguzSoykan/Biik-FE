import client from './client'

export const sendFeedback = async ({ query, adayId, verdict, sessionId = null, comment = null }) => {
  const res = await client.post('/feedback', {
    query,
    aday_id: adayId,
    verdict,
    session_id: sessionId,
    comment,
  })
  return res.data
}

export const getFeedbackStats = async () => {
  const res = await client.get('/feedback/stats')
  return res.data
}
