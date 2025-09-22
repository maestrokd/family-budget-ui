import React from 'react'
import {HealthCheckTelegram} from "@/components/HealthCheckTelegram.tsx";
import {HealthCheckTelegramAuthCard} from "@/components/HealthCheckTelegramAuthCard.tsx";

const TelegramHealthDashboard2: React.FC = () => (
    <div className="w-full bg-background">
        <HealthCheckTelegram/>
        <HealthCheckTelegramAuthCard/>
    </div>
)

export default TelegramHealthDashboard2
