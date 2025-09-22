import React from 'react'
import {HealthCheck} from '@/components/HealthCheck'
import {HealthCheckMessage} from '@/components/HealthCheckMessage'

const HealthDashboard: React.FC = () => (
    <div className="w-full max-w-md mx-auto space-y-6 bg-background p-4 sm:p-8">
        <HealthCheck/>
        <HealthCheckMessage/>
    </div>
)

export default HealthDashboard
