import { createContext, useContext } from 'react'

export const JobsContext = createContext(null)

export function useJobs() {
  return useContext(JobsContext)
}
