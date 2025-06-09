import React from 'react'
import {HealthCheckTelegram} from "@/components/HealthCheckTelegram.tsx";
import {HealthCheckTelegramAuthCard} from "@/components/HealthCheckTelegramAuthCard.tsx";

const TelegramHealthDashboard2: React.FC = () => (
    <div className="w-full max-w-md mx-auto space-y-6 p-6">
      <HealthCheckTelegram/>
      <HealthCheckTelegramAuthCard/>
    </div>
)

export default TelegramHealthDashboard2
