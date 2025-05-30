import React from 'react'
import {useQuery} from '@tanstack/react-query'
import {fetchHealthCheck, type HealthResponse} from '../services/HealthService'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Loader2Icon} from 'lucide-react'
import {AnimatePresence, motion} from 'framer-motion'

export const HealthCheck: React.FC = () => {
  const {data, isFetching, isError, refetch, error} = useQuery<HealthResponse, Error>({
        queryKey: ['health'],
        queryFn: fetchHealthCheck,
        enabled: false,
      }
  )

  return (
      <Card className="w-full shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>Service Health</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {/* FE Environment */}
          <div className="flex items-center text-sm text-gray-700">
          <span
              className="inline-block w-4 h-4 bg-indigo-500 rounded-full"
              aria-hidden="true"
          />
            <span className="ml-2">FE Env: <strong>{import.meta.env.VITE_APP_TEST_VAR}</strong></span>
          </div>

          {/* Check Button */}
          <Button
              onClick={() => refetch()}
              disabled={isFetching}
              className="w-full flex justify-center"
          >
            {isFetching && <Loader2Icon className="w-5 h-5 mr-2 animate-spin"/>}
            {isFetching ? 'Checking...' : 'Check Health'}
          </Button>

          {/* Error Message */}
          <AnimatePresence>
            {isError && (
                <motion.p
                    initial={{opacity: 0, y: -8}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -8}}
                    className="text-sm text-red-600"
                    role="alert"
                    aria-live="assertive"
                >
                  {error?.message || 'Failed to fetch health status'}
                </motion.p>
            )}
          </AnimatePresence>

          {/* Result Panel */}
          <AnimatePresence>
            {data && (
                <motion.div
                    initial={{opacity: 0, height: 0}}
                    animate={{opacity: 1, height: 'auto'}}
                    exit={{opacity: 0, height: 0}}
                    className="grid grid-cols-2 gap-4 border-t pt-4"
                >
                  <div className="flex items-center text-sm">
                <span
                    className={`inline-block w-4 h-4 rounded-full ${
                        data.status === 'OK' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    aria-label={`Status ${data.status}`}
                />
                    <span className="ml-2">Status: <strong>{data.status}</strong></span>
                  </div>
                  <div className="flex items-center text-sm">
                <span
                    className="inline-block w-4 h-4 bg-indigo-500 rounded-full"
                    aria-hidden="true"
                />
                    <span className="ml-2">BE Env: <strong>{data.env}</strong></span>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
  )
}
