import React from 'react'
import {HealthCheck} from '@/components/HealthCheck'
import {HealthCheckMessage} from '@/components/HealthCheckMessage'

const HealthDashboard: React.FC = () => (
    <div className="w-full max-w-md mx-auto space-y-6 p-6">
      <HealthCheck/>
      <HealthCheckMessage/>
    </div>
)

export default HealthDashboard
